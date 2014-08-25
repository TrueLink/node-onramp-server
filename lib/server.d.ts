import http = require('http');
import websocket = require('websocket');
import connection = require("./connection");
import connectionManager = client.connectionManager;
import event = client.event;
export interface API {
    connections: connection.API[];
    onConnected: Event<connection.API>;
    onDisconnected: Event<connection.API>;
}
export interface ConnectionManager extends ConnectionManager<connection.API> {
}
export declare class APIImpl implements API {
    private _manager;
    private _onConnected;
    private _onDisconnected;
    constructor(options: {
        manager: ConnectionManager;
        onConnected: Event<connection.API>;
        onDisconnected: Event<connection.API>;
    });
    public connections : connection.API[];
    public onConnected : Event<connection.API>;
    public onDisconnected : Event<connection.API>;
}
export declare class Server {
    static DEFAULT_PORT: number;
    private wsServer;
    private peers;
    private onConnected;
    private onDisconnected;
    constructor(wsServer: websocket.server, peers: ConnectionManager);
    static create(options?: {
        host?: string;
        hostname?: string;
        port?: number;
        httpServer?: http.Server;
        wsServer?: websocket.server;
    }): API;
    private connectionHandler(request);
    private getApi();
}
