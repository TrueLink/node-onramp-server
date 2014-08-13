var http = require('http');
var uuid = require('node-uuid');
var events = require('events');
var websocket = require('websocket');

var connectionManager = require("./connection-manager");
var connection = require("./connection");
var protocol = require("./protocol");

var APIImpl = (function () {
    function APIImpl(options) {
        this._on = options.on;
        this._removeListener = options.removeListener;
        this._manager = options.manager;
    }
    APIImpl.prototype.on = function (event, listener) {
        return this._on(event, listener);
    };

    APIImpl.prototype.removeListener = function (event, listener) {
        return this._removeListener(event, listener);
    };

    Object.defineProperty(APIImpl.prototype, "connections", {
        get: function () {
            return this._manager.get();
        },
        enumerable: true,
        configurable: true
    });
    return APIImpl;
})();
exports.APIImpl = APIImpl;

var Server = (function () {
    function Server(wsServer, connectionManager) {
        var emitter = this.emitter = new events.EventEmitter();
        this.wsServer = wsServer;

        this.peers = connectionManager;

        this.peers.onAdd = function (peer) {
            emitter.emit('connection', peer);
        };

        this.peers.onRemove = function (peer) {
            emitter.emit('disconnection', peer);
        };

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
        var address = uuid.v4();
        var peers = this.peers;
        var peer = connection.Connection.create(address, this.peers, request.accept(protocol.name, request.origin));

        peers.add(peer);

        peer.on('close', function () {
            peers.remove(peer);
        });
    };

    Server.prototype.getApi = function () {
        return new APIImpl({
            on: this.emitter.on.bind(this.emitter),
            removeListener: this.emitter.removeListener.bind(this.emitter),
            manager: this.peers
        });
    };
    Server.DEFAULT_PORT = 20500;
    return Server;
})();
exports.Server = Server;
//# sourceMappingURL=server.js.map
