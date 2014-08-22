import http = require('http');
import events = require('events');
import websocket = require('websocket');
import connection = require("./connection");
import connectionManager = client.connectionManager;
export interface API {
    on(event: string, listener: Function): events.EventEmitter;
    off(event: string, listener: Function): events.EventEmitter;
    connections: connection.API[];
}
export interface ConnectionManager extends ConnectionManager<connection.API> {
}
export declare class APIImpl implements API {
    private _on;
    private _off;
    private _manager;
    constructor(options: {
        on: (event: string, listener: Function) => events.EventEmitter;
        off: (event: string, listener: Function) => events.EventEmitter;
        manager: ConnectionManager;
    });
    public on(event: string, listener: Function): events.EventEmitter;
    public off(event: string, listener: Function): events.EventEmitter;
    public connections : connection.API[];
}
export declare class Server {
    static DEFAULT_PORT: number;
    private wsServer;
    private emitter;
    private peers;
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
