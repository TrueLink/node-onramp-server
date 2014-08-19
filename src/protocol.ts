// This module should be common for client and server. 

function notImplemented() {
    throw new Error('This method is not implemented');
}

export interface Callbacks {
    writeMessage(message: any): void;

    readPeerConnectedMessage(address: string): void;
    readPeerDisconnectedMessage(address: string): void;
    readRelayMessage(address: string, message: string): void;
    readRelayedMessage(address: string, message: string): void;
}

export var PROTOCOL_NAME = "overelay";

export class Protocol {
    MESSAGE_TYPE = {
        PEER_CONNECTED: 1,
        PEER_DICONNECTED: 2,
        RELAY: 3,
        RELAYED: 4,
    };

    private callbacks: Callbacks;

    constructor(callbacks: Callbacks) {
        this.callbacks = callbacks;
    }

    public readMessage(message: any): void {
        var MESSAGE_TYPE = this.MESSAGE_TYPE;
        var callbacks = this.callbacks;
        var messageType = message[0];

        switch (messageType) {
            case MESSAGE_TYPE.PEER_CONNECTED:
                callbacks.readPeerConnectedMessage(message[1]);
                break;

            case MESSAGE_TYPE.PEER_DICONNECTED:
                callbacks.readPeerDisconnectedMessage(message[1]);
                break;

            case MESSAGE_TYPE.RELAY:
                callbacks.readRelayMessage(message[1], message[2]);
                break;

            case MESSAGE_TYPE.RELAYED:
                callbacks.readRelayedMessage(message[1], message[2]);
                break;

            default:
                throw new Error('Unknown message type: ' + messageType);
        }
    }

    writeConnected(address: string): void {
        var message = [
            this.MESSAGE_TYPE.PEER_CONNECTED,
            address,
        ];
        this.callbacks.writeMessage(message);
    }

    writeDisconnected(address: string): void {
        var message = [
            this.MESSAGE_TYPE.PEER_DICONNECTED,
            address,
        ];
        this.callbacks.writeMessage(message);
    }

    writeRelay(address: string, content: string): void {
        var message = [
            this.MESSAGE_TYPE.RELAY,
            address,
            content,
        ];
        this.callbacks.writeMessage(message);
    }

    writeRelayed(address: string, content: string): void {
        var message = [
            this.MESSAGE_TYPE.RELAYED,
            address,
            content,
        ];
        this.callbacks.writeMessage(message);
    }

}
