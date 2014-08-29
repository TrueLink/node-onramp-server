import http = require('http');
import websocket = require('websocket');
import connection = require("./connection");
import connectionManager = client.connectionManager;
import event = client.event;
export interface ServerAPI {
    guid: string;
    connections: connection.API[];
    onConnected: Event<connection.API>;
    onDisconnected: Event<connection.API>;
}
export interface ConnectionManager extends ConnectionManager<connection.API> {
}
export declare class ServerAPIImpl implements ServerAPI {
    private _guid;
    private _manager;
    private _onConnected;
    private _onDisconnected;
    constructor(options: {
        guid: string;
        manager: ConnectionManager;
        onConnected: Event<connection.API>;
        onDisconnected: Event<connection.API>;
    });
    public guid : string;
    public connections : connection.API[];
    public onConnected : Event<connection.API>;
    public onDisconnected : Event<connection.API>;
}
export declare class Server {
    static DEFAULT_PORT: number;
    private _guid;
    private _wsServer;
    private _peers;
    private _onConnected;
    private _onDisconnected;
    constructor(guid: string, wsServer: websocket.server, peers: ConnectionManager);
    static create(options?: {
        host?: string;
        hostname?: string;
        port?: number;
        httpServer?: http.Server;
        wsServer?: websocket.server;
    }): ServerAPI;
    private connectionHandler(request);
    private getApi();
}
