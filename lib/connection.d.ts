import websocket = require('websocket');
import protocol = client.protocol;
export interface EventEmitter {
    on(event: string, listener: Function): EventEmitter;
    removeListener(event: string, listener: Function): EventEmitter;
    emit(event: string, ...args: any[]): boolean;
}
export interface EventEmitterFactory {
    new(): EventEmitter;
}
export interface API {
    address: string;
    connected(remoteId: string): void;
    disconnected(remoteId: string): void;
    relayed(remoteId: string, message: string): void;
    on(event: string, listener: Function): EventEmitter;
    off(event: string, listener: Function): EventEmitter;
}
export interface IManager {
    get(destination: string): API;
}
export declare class Connection extends Protocol implements Callbacks {
    private address;
    private peers;
    private connection;
    private emitter;
    static EventEmitter: EventEmitterFactory;
    constructor(address: string, peers: IManager, connection: websocket.connection);
    static create(address: string, peers: IManager, raw: websocket.connection): API;
    private getApi();
    private messageHandler(raw);
    public readMessageData(data: string): void;
    private closeHandler();
    public writeMessage(message: any): void;
    public readPeerConnectedMessage(destination: string): void;
    public readPeerDisconnectedMessage(destination: string): void;
    /**
    * Received message that has to be sent to another destination.
    *
    * @param {string} destination Destination for the message.
    * @param {any} message        The message.
    */
    public readRelayMessage(destination: string, message: any): void;
    public readRelayedMessage(destination: string, message: any): void;
}
