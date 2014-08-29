var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var client = require('browser-relay-client');

var protocol = client.protocol;
var event = client.event;

// TODO: Add websocket subclass
var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(endpoint, connection) {
        _super.call(this);
        this._onClose = new event.Event();
        this._onRelay = new event.Event();

        this.setReactions(this);

        this._endpoint = endpoint;
        this._connection = connection;

        connection.on('message', this.messageHandler.bind(this));
        connection.on('close', this.closeHandler.bind(this));
    }
    Connection.create = function (guid, endpoint, raw) {
        var instance = new Connection(endpoint, raw);
        instance.writeIdentification(guid, instance._endpoint);
        return instance.getApi();
    };

    Connection.prototype.getApi = function () {
        return {
            endpoint: this._endpoint,
            connected: this.writeConnected.bind(this),
            disconnected: this.writeDisconnected.bind(this),
            relayed: this.writeRelayed.bind(this),
            onClose: this._onClose,
            onRelay: this._onRelay
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
        this._onClose.emit(this._endpoint);
    };

    Connection.prototype.writeMessage = function (message) {
        var data = JSON.stringify(message);
        console.log("-->", data);
        this._connection.sendUTF(data);
    };

    Connection.prototype.readPeerConnectedMessage = function (destination) {
        console.error("onramp server have nothing to do with connectivity map");
    };

    Connection.prototype.readPeerDisconnectedMessage = function (destination) {
        console.error("onramp server have nothing to do with connectivity map");
    };

    Connection.prototype.readAddRoutesMessage = function (table) {
        console.error("routing table received", table);
    };

    Connection.prototype.readIdentificationMessage = function (authority, endpoint) {
        console.error("don't give me a names");
    };

    Connection.prototype.readRelayMessage = function (destination, message) {
        this._onRelay.emit({
            destination: destination,
            message: message
        });
    };

    Connection.prototype.readRelayedMessage = function (destination, message) {
        console.error("onramp server can't receive messages");
    };
    return Connection;
})(protocol.Protocol);
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map
