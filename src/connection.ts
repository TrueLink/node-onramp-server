import websocket = require('websocket');
import client = require('browser-relay-client');
import connectionManager = client.connectionManager;
import protocol = client.protocol;
import event = client.event;

export interface RelayData {
    destination: string;
    message: any;
}

export interface API {
    endpoint: string; // readonly
    connected(remoteAddr: string): void;
    disconnected(remoteAddr: string): void;
    relayed(remoteAddr: string, message: string): void;
    onClose: event.Event<string>; // readonly
    onRelay: event.Event<RelayData>; // readonly
}

// TODO: Add websocket subclass 

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private _endpoint: string;
    private _connection: websocket.connection;

    private onClose: event.Event<string>;
    private onRelay: event.Event<RelayData>;

    constructor(endpoint: string, connection: websocket.connection) {
        super(this);
        this._endpoint = endpoint;
        this._connection = connection;

        this.onClose = new event.Event<string>();
        this.onRelay = new event.Event<RelayData>();

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }

    static create(endpoint: string, raw: websocket.connection): API {
        var instance = new Connection(endpoint, raw);
        instance.writeIdentification(instance._endpoint);
        return instance.getApi();
    }

    private getApi(): API {
        return {
            endpoint: this._endpoint,
            connected: this.writeConnected.bind(this),
            disconnected: this.writeDisconnected.bind(this),
            relayed: this.writeRelayed.bind(this),
            onClose: this.onClose,
            onRelay: this.onRelay,
        };
    }

    private messageHandler(raw: websocket.IMessage): void {
        if (raw.type === "utf8") {
            this.readMessageData(raw.utf8Data);
        }
    }

    public readMessageData(data: string) {
        var message = JSON.parse(data);
        console.log("<--", message);
        this.readMessage(message);
    }

    private closeHandler(): void {
        this.onClose.emit(this._endpoint);
    }

    public writeMessage(message: any): void {
        var data = JSON.stringify(message);
        console.log("-->", data);
        this._connection.sendUTF(data);
    }

    public readPeerConnectedMessage(destination: string): void {
        console.error("onramp server have nothing to do with connectivity map");
    }

    public readPeerDisconnectedMessage(destination: string): void {
        console.error("onramp server have nothing to do with connectivity map");
    }

    public readIdentificationMessage(id: string): void {
        console.error("don't give me a names");        
    }

    public readRelayMessage(destination: string, message: any): void {
        this.onRelay.emit({
            destination: destination,
            message: message
        })
    }

    public readRelayedMessage(destination: string, message: any): void {
        console.error("onramp server can't receive messages");
    }
}

