import websocket = require('websocket');
import protocol = client.protocol;
import event = client.event;
export interface RelayData {
    destination: string;
    message: any;
}
export interface API {
    endpoint: string;
    connected(remoteAddr: string): void;
    disconnected(remoteAddr: string): void;
    relayed(remoteAddr: string, message: string): void;
    onClose: Event<string>;
    onRelay: Event<RelayData>;
}
export declare class Connection extends Protocol implements Callbacks {
    private _endpoint;
    private _connection;
    private onClose;
    private onRelay;
    constructor(endpoint: string, connection: websocket.connection);
    static create(endpoint: string, raw: websocket.connection): API;
    private getApi();
    private messageHandler(raw);
    public readMessageData(data: string): void;
    private closeHandler();
    public writeMessage(message: any): void;
    public readPeerConnectedMessage(destination: string): void;
    public readPeerDisconnectedMessage(destination: string): void;
    public readIdentificationMessage(id: string): void;
    public readRelayMessage(destination: string, message: any): void;
    public readRelayedMessage(destination: string, message: any): void;
}
