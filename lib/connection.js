var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var client = require('browser-relay-client');
var protocol = client.protocol;
var event = client.event;

var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(address, connection) {
        _super.call(this, this);
        this.address = address;
        this.connection = connection;

        this.onClose = new event.Event();
        this.onRelay = new event.Event();

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }
    Connection.create = function (address, raw) {
        var intance = new Connection(address, raw);
        return intance.getApi();
    };

    Connection.prototype.getApi = function () {
        return {
            address: this.address,
            ///connected: this.writeConnected.bind(this),
            connected: this.writeDirect.bind(this),
            disconnected: this.writeDisconnected.bind(this),
            relayed: this.writeRelayed.bind(this),
            onClose: this.onClose,
            onRelay: this.onRelay
        };
    };

    Connection.prototype.messageHandler = function (raw) {
        if (raw.type === "utf8") {
            this.readMessageData(raw.utf8Data);
        }
    };

    Connection.prototype.readMessageData = function (data) {
        var message = JSON.parse(data);
        console.log("<--", message);
        this.readMessage(message);
    };

    Connection.prototype.closeHandler = function () {
        this.onClose.emit(this.getApi());
    };

    Connection.prototype.writeMessage = function (message) {
        var data = JSON.stringify(message);
        console.log("-->", data);
        this.connection.sendUTF(data);
    };

    Connection.prototype.readPeerConnectedMessage = function (destination) {
        throw new Error("onramp server have nothing to do with connectivity map");
    };

    Connection.prototype.readPeerDisconnectedMessage = function (destination) {
        throw new Error("onramp server have nothing to do with connectivity map");
    };

    /**
    * Received message that has to be sent to another destination.
    *
    * @param {string} destination Destination for the message.
    * @param {any} message        The message.
    */
    Connection.prototype.readRelayMessage = function (destination, message) {
        this.onRelay.emit({
            source: this.getApi(),
            destination: destination,
            message: message
        });
    };

    Connection.prototype.readRelayedMessage = function (destination, message) {
        throw new Error("onramp server can't receive messages");
    };
    return Connection;
})(protocol.Protocol);
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map
