import websocket = require('websocket');
import protocol = client.protocol;
import event = client.event;
export interface RelayData {
    destination: string;
    message: any;
}
export interface API {
    address: string;
    connected(remoteAddr: string): void;
    disconnected(remoteAddr: string): void;
    relayed(remoteAddr: string, message: string): void;
    onClose: Event<string>;
    onRelay: Event<RelayData>;
}
export declare class Connection extends Protocol implements Callbacks {
    private address;
    private connection;
    private onClose;
    private onRelay;
    constructor(address: string, connection: websocket.connection);
    static create(address: string, raw: websocket.connection): API;
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
