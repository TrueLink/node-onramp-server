import websocket = require('websocket');
import client = require('browser-relay-client');
import protocol = client.protocol;
import event = client.event;

export interface API {
    address: string;
    connected(remoteId: string): void;
    disconnected(remoteId: string): void;
    relayed(remoteId: string, message: string): void;
    onClose: event.Event<API>;
}

export interface ConnectionsManager {
    get(destination: string): API;
}

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address: string;
    private peers: ConnectionsManager;
    private connection: websocket.connection;

    private onClose: event.Event<API>;

    constructor(address: string, peers: ConnectionsManager, connection: websocket.connection) {
        super(this);
        this.address = address;
        this.peers = peers;
        this.connection = connection;

        this.onClose = new event.Event<API>();

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }

    static create(address: string, peers: ConnectionsManager, raw: websocket.connection): API {
        var intance = new Connection(address, peers, raw);
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
        };
    }

    private messageHandler(raw: websocket.IMessage): void {
        console.log('message', raw);

        if (raw.type === "utf8") {
            this.readMessageData(raw.utf8Data);
        }
    }

    public readMessageData(data: string) {
        var message = JSON.parse(data);
        this.readMessage(message);
    }

    private closeHandler(): void {
        this.onClose.emit(this.getApi());
    }

    public writeMessage(message: any): void {
        var stringified = JSON.stringify(message);
        this.connection.sendUTF(stringified);
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
        // searching connection for destination
        var peer = this.peers.get(destination);
        if (!peer) return;

        // sending message to destination
        peer.relayed(this.address, message);
    }

    public readRelayedMessage(destination: string, message: any): void {
        throw new Error("onramp server can't receive messages");
    }
}

