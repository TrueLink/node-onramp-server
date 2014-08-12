import events = require('events');
import websocket = require('websocket');
import connectionManager = require("./connection-manager");
import protocol = require('./protocol');

var MESSAGE_TYPE = protocol.MESSAGE_TYPE;
var PROTOCOL_NAME = protocol.NAME;

export interface API {
    address: string;
    send(message: string): void;
    relay(remoteId: string, message: string): void;
    relayed(remoteId: string, message: string): void;
    on(event: string, listener: Function): events.EventEmitter;
    removeListener(event: string, listener: Function): events.EventEmitter;
}

export class Connection {
    public address: string;
    private emitter: events.EventEmitter;
    private peers: connectionManager.ConnectionManager;
    private connection: websocket.connection;

    constructor(address: string, peers: connectionManager.ConnectionManager, connection: websocket.connection) {
        this.address = address;
        this.peers = peers;
        this.connection = connection;
        this.emitter = new events.EventEmitter();

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }

    static create(address: string, peers, raw): API {
        var intance = new Connection(address, peers, raw);
        return intance.getApi();
    }

    private getApi(): API {
        return {
            address: this.address,
            send: this.send.bind(this),
            relay: this.relay.bind(this),
            relayed: this.relayed.bind(this),
            on: this.emitter.on.bind(this.emitter),
            removeListener: this.emitter.removeListener.bind(this.emitter)
        };
    }

    private send(message) {
        if (message instanceof ArrayBuffer) {
            this.connection.sendBinary(message);
        } else {
            this.sendProtocolMessage([MESSAGE_TYPE.PLAIN, message]);
        }
    }

    private messageHandler(message) {
        console.log('message', message);

        if (message.type === "utf8") {
            message = JSON.parse(message.utf8Data);

            switch (message[0]) {
                case MESSAGE_TYPE.PLAIN:
                    this.emitter.emit('message', message[1]);
                    break;
                case MESSAGE_TYPE.RELAY:
                    this.relayHandler(
                        message[1], // detinationId
                        message[2]  // message
                        );
                    break;
            }
        }
    }

    private closeHandler() {
        this.emitter.emit('close');
    }

    private sendProtocolMessage(message) {
        var stringified = JSON.stringify(message);
        this.connection.sendUTF(stringified);
    }

    private relayHandler(destination: string, message) {
        var peer = this.peers.get(destination);
        if (!peer) return;

        peer.relayed(this.address, message);
    }

    private relay(remoteId: string, message: string) {
        this.sendProtocolMessage([MESSAGE_TYPE.RELAY, remoteId, message]);
    }

    private relayed(remoteId: string, message: string) {
        this.sendProtocolMessage([MESSAGE_TYPE.RELAYED, remoteId, message]);
    }
}

