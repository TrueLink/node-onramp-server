import websocket = require('websocket');
import client = require('browser-relay-client');
import protocol = client.protocol;
import event = client.event;

export interface RelayData {
    source: API;
    destination: string;
    message: any;
}

export interface API {
    address: string;
    connected(remoteId: string): void;
    disconnected(remoteId: string): void;
    relayed(remoteId: string, message: string): void;
    onClose: event.Event<API>;
    onRelay: event.Event<RelayData>;
}

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address: string;
    private connection: websocket.connection;

    private onClose: event.Event<API>;
    private onRelay: event.Event<RelayData>;

    constructor(address: string, connection: websocket.connection) {
        super(this);
        this.address = address;
        this.connection = connection;

        this.onClose = new event.Event<API>();
        this.onRelay = new event.Event<RelayData>();

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }

    static create(address: string, raw: websocket.connection): API {
        var intance = new Connection(address, raw);
        return intance.getApi();
    }

    private getApi(): API {
        return {
            address: this.address,
            ///connected: this.writeConnected.bind(this),
            connected: this.writeDirect.bind(this),
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
        this.onClose.emit(this.getApi());
    }

    public writeMessage(message: any): void {
        var data = JSON.stringify(message);
        console.log("-->", data);
        this.connection.sendUTF(data);
    }

    public readPeerConnectedMessage(destination: string): void {
        throw new Error("onramp server have nothing to do with connectivity map");
    }

    public readPeerDisconnectedMessage(destination: string): void {
        throw new Error("onramp server have nothing to do with connectivity map");
    }

    /**
     * Received message that has to be sent to another destination.
     *
     * @param {string} destination Destination for the message.
     * @param {any} message        The message.
     */
    public readRelayMessage(destination: string, message: any): void {
        this.onRelay.emit({
            source: this.getApi(),
            destination: destination,
            message: message
        })
    }

    public readRelayedMessage(destination: string, message: any): void {
        throw new Error("onramp server can't receive messages");
    }
}

