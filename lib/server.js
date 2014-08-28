var http = require('http');
var uuid = require('node-uuid');
var websocket = require('websocket');
var connection = require("./connection");

var client = require("browser-relay-client");
var connectionManager = client.connectionManager;
var protocol = client.protocol;
var event = client.event;

var APIImpl = (function () {
    function APIImpl(options) {
        this._manager = options.manager;
        this._onConnected = options.onConnected;
        this._onDisconnected = options.onDisconnected;
    }
    Object.defineProperty(APIImpl.prototype, "connections", {
        get: function () {
            return this._manager.get();
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(APIImpl.prototype, "onConnected", {
        get: function () {
            return this._onConnected;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(APIImpl.prototype, "onDisconnected", {
        get: function () {
            return this._onDisconnected;
        },
        enumerable: true,
        configurable: true
    });
    return APIImpl;
})();
exports.APIImpl = APIImpl;

var Server = (function () {
    function Server(wsServer, peers) {
        var _this = this;
        this.wsServer = wsServer;

        this.peers = peers;

        this.onConnected = new event.Event();
        this.onDisconnected = new event.Event();

        this.peers.onAdd.on(function (connection) {
            _this.onConnected.emit(connection);
            console.log('peer connected: ' + connection.endpoint + " (" + _this.peers.length + ")");
            _this.peers.get().forEach(function (other) {
                if (other === connection)
                    return;
                connection.connected(other.endpoint);
                other.connected(connection.endpoint);
            });
        });

        this.peers.onRemove.on(function (connection) {
            _this.onDisconnected.emit(connection);
            console.log('peer disconnected: ' + connection.endpoint + " (" + _this.peers.length + ")");
            _this.peers.get().forEach(function (other) {
                if (other === connection)
                    return;
                other.disconnected(connection.endpoint);
            });
        });

        this.wsServer.on('request', this.connectionHandler.bind(this));
    }
    Server.create = function (options) {
        if (typeof options === "undefined") { options = {}; }
        if (options.host) {
            var host = options.host.split(':');

            if (!('hostname' in options))
                options.hostname = host[0];
            if (!('port' in options) && host[1])
                options.port = parseInt(host[1]);
        }

        if (!('port' in options)) {
            options.port = Server.DEFAULT_PORT;
        }

        if (!('httpServer' in options)) {
            options.httpServer = http.createServer();

            console.log('onramp listening on ' + (options.hostname ? options.hostname : "*") + ":" + options.port);

            options.httpServer.listen(options.port, options.hostname || void 0);
        }

        if (!('wsServer' in options)) {
            options.wsServer = new websocket.server({
                httpServer: options.httpServer,
                autoAcceptConnections: false
            });
        }

        var manager = new connectionManager.ConnectionManager();

        var server = new Server(options.wsServer, manager);
        return server.getApi();
    };

    Server.prototype.connectionHandler = function (request) {
        var _this = this;
        var rcid = uuid.v4();
        var peers = this.peers;
        var endpoint = "ramp://" + request.host + "/" + rcid;

        var wsConn = request.accept(protocol.PROTOCOL_NAME, request.origin);

        var peer = connection.Connection.create(endpoint, wsConn);

        peers.add(peer);

        peer.onRelay.on(function (data) {
            var destination = _this.peers.get(data.destination);
            if (!destination)
                return;
            console.log("relaying message from " + peer.endpoint + " to " + data.destination);
            destination.relayed(peer.endpoint, data.message);
        });

        peer.onClose.on(function (address) {
            peers.remove(peer);
        });
    };

    Server.prototype.getApi = function () {
        return new APIImpl({
            manager: this.peers,
            onConnected: this.onConnected,
            onDisconnected: this.onDisconnected
        });
    };
    Server.DEFAULT_PORT = 20500;
    return Server;
})();
exports.Server = Server;
//# sourceMappingURL=server.js.map
