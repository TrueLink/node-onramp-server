import http = require('http');
import uuid = require('node-uuid');
import events = require('events');
import websocket = require('websocket');

import connectionManager = require("./connection-manager");
import connection = require("./connection");
import protocol = require("./protocol");

export interface API {
    on(event: string, listener: Function): events.EventEmitter;
    removeListener(event: string, listener: Function): events.EventEmitter;
    connections: connection.API[];
}

export class APIImpl implements API {
    private _on: (event: string, listener: Function) => events.EventEmitter;
    private _removeListener: (event: string, listener: Function) => events.EventEmitter;
    private _manager: connectionManager.ConnectionManager;

    constructor(options: {
        on: (event: string, listener: Function) => events.EventEmitter;
        removeListener: (event: string, listener: Function) => events.EventEmitter;
        manager: connectionManager.ConnectionManager;
    }) {
        this._on = options.on;
        this._removeListener = options.removeListener;
        this._manager = options.manager;
    }

    on(event: string, listener: Function): events.EventEmitter {
        return this._on(event, listener);
    }

    removeListener(event: string, listener: Function): events.EventEmitter {
        return this._removeListener(event, listener);
    }

    get connections(): connection.API[] {
        return this._manager.get();
    }
}


export class Server {
    static DEFAULT_PORT: number = 20500;

    private wsServer: websocket.server;
    private emitter: events.EventEmitter;
    private peers: connectionManager.ConnectionManager;

    constructor(wsServer: websocket.server, connectionManager: connectionManager.ConnectionManager) {
        var emitter = this.emitter = new events.EventEmitter();
        this.wsServer = wsServer;

        this.peers = connectionManager;

        this.peers.onAdd = function (peer) {
            emitter.emit('connection', peer);
        };

        this.peers.onRemove = function (peer) {
            emitter.emit('disconnection', peer);
        };

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
            var host: string[] = options.host.split(':');

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

        var manager = new connectionManager.ConnectionManager();

        var server = new Server(options.wsServer, manager);
        return server.getApi();
    }

    private connectionHandler(request: websocket.request) {
        var address = uuid.v4();
        var peers = this.peers;
        var peer = connection.Connection.create(address, this.peers, request.accept(protocol.name, request.origin));

        peers.add(peer);

        peer.on('close', function () {
            peers.remove(peer);
        });
    }

    private getApi(): API {
        return new APIImpl({
            on: this.emitter.on.bind(this.emitter),
            removeListener: this.emitter.removeListener.bind(this.emitter),
            manager: this.peers,
        });
    }
}

