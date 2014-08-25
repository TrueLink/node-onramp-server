import websocket = require('websocket');
import protocol = client.protocol;
import event = client.event;
export interface API {
    address: string;
    connected(remoteId: string): void;
    disconnected(remoteId: string): void;
    relayed(remoteId: string, message: string): void;
    onClose: Event<API>;
}
export interface ConnectionsManager {
    get(destination: string): API;
}
export declare class Connection extends Protocol implements Callbacks {
    private address;
    private peers;
    private connection;
    private onClose;
    constructor(address: string, peers: ConnectionsManager, connection: websocket.connection);
    static create(address: string, peers: ConnectionsManager, raw: websocket.connection): API;
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
