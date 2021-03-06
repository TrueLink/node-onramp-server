﻿import http = require('http');
import uuid = require('node-uuid');
import websocket = require('websocket');
import connection = require("./connection");

import client = require("browser-relay-client");
import connectionManager = client.connectionManager;
import protocol = client.protocol;
import event = client.event;
import routing = client.routing;

export interface ServerAPI {
    guid: string;
    connections(): connection.API[];
    onConnected: event.Event<connection.API>;
    onDisconnected: event.Event<connection.API>;
    onRoutingChanged: event.Event<routing.RoutingTable>;
}

export interface ConnectionManager extends connectionManager.ConnectionManager<connection.API> {
}

export class Server {
    static DEFAULT_PORT: number = 20500;

    private _guid: string;
    private _address: string;
    private _wsServer: websocket.server;
    private _peers: ConnectionManager;
    private _routing: routing.RoutingTable = new routing.RoutingTable();

    private _onConnected: event.Event<connection.API> = new event.Event<connection.API>();
    private _onDisconnected: event.Event<connection.API> = new event.Event<connection.API>();
    private _onRoutingChanged: event.Event<any> = new event.Event<routing.RoutingTable>();

    constructor(guid: string, address: string, wsServer: websocket.server, peers: ConnectionManager) {
        this._guid = guid;
        this._wsServer = wsServer;

        this._peers = peers;
        this._address = address;

        this._routing.add(new routing.RoutingRow(this._guid, null, this._address));

        this._peers.onAdd.on((connection) => {
            this._onConnected.emit(connection);
        });

        this._peers.onRemove.on((connection) => {
            this._onDisconnected.emit(connection);
        });

        this._onConnected.on((connection) => {
            console.log('peer connected: ' + connection.endpoint + " (" + this._peers.length + ")");
            this._peers.get().forEach(function (other) {
                if (other === connection) return;
                connection.connected(other.endpoint);
                other.connected(connection.endpoint);
            });
        });

        this._onDisconnected.on((connection) => {
            console.log('peer disconnected: ' + connection.endpoint + " (" + this._peers.length + ")");
            this._peers.get().forEach(function (other) {
                if (other === connection) return;
                other.disconnected(connection.endpoint);
            });
        });

        this._onRoutingChanged.on((table) => {
            var serialized = table.serialize();
            this._peers.get().forEach(function (other) {
                other.addroutes(serialized);
            });
        });

        this._wsServer.on('request', this.connectionHandler.bind(this));
    }

    public static create(options: {
        host?: string;
        hostname?: string;
        port?: number;
        wsServer?: websocket.server;
    } = {}) {
        var guid = uuid.v4();

        if (options.host) {
            var host = options.host.split(':');

            if (!('hostname' in options)) options.hostname = host[0];
            if (!('port' in options) && host[1]) options.port = parseInt(host[1]);
        }

        if (!('port' in options)) {
            options.port = Server.DEFAULT_PORT;
        }

        var address = "ws://" + (options.hostname ? options.hostname : "*") + ":" + options.port + "/";
        var httpServer = http.createServer();
        console.log('onramp listening on ' + address, guid);
        httpServer.listen(options.port, options.hostname || void 0);

        var wsServer = new websocket.server({
            httpServer: httpServer,
            autoAcceptConnections: false
        });

        var manager = new connectionManager.ConnectionManager<connection.API>();

        var server = new Server(guid, address, wsServer, manager);

        return server.getApi();
    }

    private connectionHandler(request: websocket.request) {
        var rcid = uuid.v4();
        var peers = this._peers;
        var endpoint = "ramp://" + request.host + "/" + rcid;

        var wsConn = request.accept(protocol.PROTOCOL_NAME, request.origin);

        var peer = connection.Connection.create(this._guid, endpoint, wsConn);

        peers.add(peer);

        peer.onRelay.on((data) => {
            var destination = this._peers.get(data.destination);
            if (!destination) return;
            console.log("relaying message from " + peer.endpoint + " to " + data.destination);
            destination.relayed(peer.endpoint, data.message);
        });

        peer.onClose.on((address) => {
            peers.remove(peer);
        });

        peer.onRoutesReceived.on((table) => {
            var routes = routing.RoutingTable.deserialize(table);
            routes.subtract(this._routing);
            if (routes.length > 0) {
                this._routing.update(routes);
                this._onRoutingChanged.emit(this._routing);
            }
        });
    }

    private getApi(): ServerAPI {
        return {
            guid: this._guid,
            connections: () => {
                return this._peers.get();
            },
            onConnected: this._onConnected,
            onDisconnected: this._onDisconnected,
            onRoutingChanged: this._onRoutingChanged,
        };
    }
}

