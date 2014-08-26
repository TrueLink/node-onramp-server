import http = require('http');
import uuid = require('node-uuid');
import websocket = require('websocket');
import connection = require("./connection");

import client = require("browser-relay-client");
import connectionManager = client.connectionManager;
import protocol = client.protocol;
import event = client.event;

export interface API {
    connections: connection.API[];
    onConnected: event.Event<connection.API>;
    onDisconnected: event.Event<connection.API>;
}

export interface ConnectionManager extends connectionManager.ConnectionManager<connection.API> {
}

export class APIImpl implements API {
    private _manager: ConnectionManager;

    private _onConnected: event.Event<connection.API>;
    private _onDisconnected: event.Event<connection.API>;

    constructor(options: {
        manager: ConnectionManager;
        onConnected: event.Event<connection.API>;
        onDisconnected: event.Event<connection.API>;
    }) {
        this._manager = options.manager;
        this._onConnected = options.onConnected;
        this._onDisconnected = options.onDisconnected;
    }

    public get connections(): connection.API[] {
        return this._manager.get();
    }

    public get onConnected(): event.Event<connection.API> {
        return this._onConnected;
    }

    public get onDisconnected(): event.Event<connection.API> {
        return this._onDisconnected;
    }
}


export class Server {
    static DEFAULT_PORT: number = 20500;

    private wsServer: websocket.server;
    private peers: ConnectionManager;

    private onConnected: event.Event<connection.API>;
    private onDisconnected: event.Event<connection.API>;

    constructor(wsServer: websocket.server, peers: ConnectionManager) {
        this.wsServer = wsServer;

        this.peers = peers;

        this.onConnected = new event.Event<connection.API>();
        this.onDisconnected = new event.Event<connection.API>();

        this.peers.onAdd.on((connection) => {
            this.onConnected.emit(connection);
            console.log('peer connected: ' + connection.address + " (" + this.peers.length + ")");
            this.peers.get().forEach(function (other) {
                if (other === connection) return;
                connection.connected(other.address);
                other.connected(connection.address);
            });
        });

        this.peers.onRemove.on((connection) => {
            this.onDisconnected.emit(connection);
            console.log('peer disconnected: ' + connection.address + " (" + this.peers.length + ")");
            this.peers.get().forEach(function (other) {
                if (other === connection) return;
                other.disconnected(connection.address);
            });
        });

        this.wsServer.on('request', this.connectionHandler.bind(this));
    }

    public static create(options: {
        host?: string;
        hostname?: string;
        port?: number;
        httpServer?: http.Server;
        wsServer?: websocket.server;
    } = {}) {

        if (options.host) {
            var host = options.host.split(':');

            if (!('hostname' in options)) options.hostname = host[0];
            if (!('port' in options) && host[1]) options.port = parseInt(host[1]);
        }

        if (!('port' in options)) {
            options.port = Server.DEFAULT_PORT;
        }

        if (!('httpServer' in options)) {
            options.httpServer = http.createServer();

            console.log('onramp listening on ' + (options.hostname ? options.hostname : "*") + ":" + options.port);

            options.httpServer.listen(options.port, options.hostname || void 0);
        }

        if (!('wsServer' in options)) {
            options.wsServer = new websocket.server({
                httpServer: options.httpServer,
                autoAcceptConnections: false
            });
        }

        var manager = new connectionManager.ConnectionManager<connection.API>();

        var server = new Server(options.wsServer, manager);
        return server.getApi();
    }

    private connectionHandler(request: websocket.request) {
        var address = uuid.v4();
        var peers = this.peers;

        var wsConn = request.accept(protocol.PROTOCOL_NAME, request.origin);

        var peer = connection.Connection.create(address, wsConn);

        peers.add(peer);

        peer.onRelay.on((data) => {
            var destination = this.peers.get(data.destination);
            if (!destination) return;
            console.log("relaying message from " + peer.address + " to " + data.destination);
            destination.relayed(peer.address, data.message);
        });

        peer.onClose.on((address) => {
            peers.remove(peer);
        });
    }

    private getApi(): API {
        return new APIImpl({
            manager: this.peers,
            onConnected: this.onConnected,
            onDisconnected: this.onDisconnected,
        });
    }
}

