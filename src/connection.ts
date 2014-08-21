import websocket = require('websocket');
import protocol = require('./protocol');

export interface EventEmitter {
    on(event: string, listener: Function): EventEmitter;
    removeListener(event: string, listener: Function): EventEmitter;
    emit(event: string, ...args: any[]): boolean;
}

export interface EventEmitterFactory {
    new (): EventEmitter;
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

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address: string;
    private peers: IManager;
    private connection: websocket.connection;
    private emitter: EventEmitter;

    static EventEmitter: EventEmitterFactory;

    constructor(address: string, peers: IManager, connection: websocket.connection) {
        super(this);
        this.address = address;
        this.peers = peers;
        this.connection = connection;
        this.emitter = new Connection.EventEmitter();

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }

    static create(address: string, peers: IManager, raw: websocket.connection): API {
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
            on: this.emitter.on.bind(this.emitter),
            off: this.emitter.removeListener.bind(this.emitter)
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
        this.emitter.emit('close');
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

