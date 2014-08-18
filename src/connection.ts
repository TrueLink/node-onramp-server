import events = require('events');
import websocket = require('websocket');
import connectionManager = require("./connection-manager");
import protocol = require('./protocol');

export interface API {
    address: string;
    //connected(remoteId: string): void;
    //disconnected(remoteId: string): void;
    //relay(remoteId: string, message: string): void;
    //relayed(remoteId: string, message: string): void;
    on(event: string, listener: Function): events.EventEmitter;
    removeListener(event: string, listener: Function): events.EventEmitter;
}

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address: string;
    private peers: connectionManager.ConnectionManager;
    private connection: websocket.connection;
    private emitter: events.EventEmitter;

    constructor(address: string, peers: connectionManager.ConnectionManager, connection: websocket.connection) {
        super(this);
        this.address = address;
        this.peers = peers;
        this.connection = connection;
        this.emitter = new events.EventEmitter();

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }

    static create(address: string, peers: connectionManager.ConnectionManager, raw: websocket.connection): API {
        var intance = new Connection(address, peers, raw);
        return intance.getApi();
    }

    private getApi(): API {
        return {
            address: this.address,
            //connected: this.connected.bind(this),
            //disconnected: this.disconnected.bind(this),
            //relay: this.relay.bind(this),
            //relayed: this.relayed.bind(this),
            on: this.emitter.on.bind(this.emitter),
            removeListener: this.emitter.removeListener.bind(this.emitter)
        };
    }

    private messageHandler(raw: websocket.IMessage) {
        console.log('message', raw);

        if (raw.type === "utf8") {
            var message = JSON.parse(raw.utf8Data);
            this.readMessage(message);
        }
    }

    private closeHandler() {
        this.emitter.emit('close');
    }

    public writeMessage(message: any) {
        var stringified = JSON.stringify(message.getData());
        this.connection.sendUTF(stringified);
    }

    public readPeerConnectedMessage(destination: string) {
    }

    public readPeerDisconnectedMessage(destination: string) {
    }

    public readRelayMessage(destination: string, message: any) {
        var peer = this.peers.get(destination);
        if (!peer) return;

        //peer.relay(this.address, message);
    }

    public readRelayedMessage(destination: string, message: any) {
    }
}

