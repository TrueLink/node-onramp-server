// This module should be common for client and server.
function notImplemented() {
    throw new Error('This method is not implemented');
}

exports.PROTOCOL_NAME = "p";

var Protocol = (function () {
    function Protocol(callbacks) {
        this.MESSAGE_TYPE = {
            DIRECT: 0,
            PEER_CONNECTED: 1,
            PEER_DICONNECTED: 2,
            RELAY: 6,
            RELAYED: 7
        };
        this.callbacks = callbacks;
    }
    Protocol.prototype.readMessage = function (message) {
        console.log(message);
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
    };

    Protocol.prototype.writeDirect = function (content) {
        var message = [
            this.MESSAGE_TYPE.DIRECT,
            content
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeConnected = function (address) {
        var message = [
            this.MESSAGE_TYPE.PEER_CONNECTED,
            address
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeDisconnected = function (address) {
        var message = [
            this.MESSAGE_TYPE.PEER_DICONNECTED,
            address
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeRelay = function (address, content) {
        var message = [
            this.MESSAGE_TYPE.RELAY,
            address,
            content
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeRelayed = function (address, content) {
        var message = [
            this.MESSAGE_TYPE.RELAYED,
            address,
            content
        ];
        this.callbacks.writeMessage(message);
    };
    return Protocol;
})();
exports.Protocol = Protocol;
//# sourceMappingURL=protocol.js.map
