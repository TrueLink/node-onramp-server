var events = require('events');

var protocol = require('./protocol');

var Connection = (function () {
    function Connection(address, peers, connection) {
        this.address = address;
        this.peers = peers;
        this.connection = connection;
        this.emitter = new events.EventEmitter();

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }
    Connection.create = function (address, peers, raw) {
        var intance = new Connection(address, peers, raw);
        return intance.getApi();
    };

    Connection.prototype.getApi = function () {
        return {
            address: this.address,
            send: this.send.bind(this),
            relay: this.relay.bind(this),
            relayed: this.relayed.bind(this),
            on: this.emitter.on.bind(this.emitter),
            removeListener: this.emitter.removeListener.bind(this.emitter)
        };
    };

    Connection.prototype.messageHandler = function (raw) {
        console.log('message', raw);

        if (raw.type === "utf8") {
            var message = protocol.parse(JSON.parse(raw.utf8Data));

            switch (message.type) {
                case protocol.MESSAGE_TYPE_PLAIN:
                    this.emitter.emit('message', message.content);
                    break;
                case protocol.MESSAGE_TYPE_RELAY:
                    this.relayHandler(message.address, message.content);
                    break;
            }
        }
    };

    Connection.prototype.closeHandler = function () {
        this.emitter.emit('close');
    };

    Connection.prototype.sendProtocolMessage = function (message) {
        var stringified = JSON.stringify(message.getData);
        this.connection.sendUTF(stringified);
    };

    Connection.prototype.relayHandler = function (destination, message) {
        var peer = this.peers.get(destination);
        if (!peer)
            return;

        peer.relayed(this.address, message);
    };

    Connection.prototype.send = function (message) {
        this.sendProtocolMessage(protocol.plain(message));
    };

    Connection.prototype.relay = function (remoteId, message) {
        this.sendProtocolMessage(protocol.relay(remoteId, message));
    };

    Connection.prototype.relayed = function (remoteId, message) {
        this.sendProtocolMessage(protocol.relayed(remoteId, message));
    };
    return Connection;
})();
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map
