var http = require('http');
var uuid = require('node-uuid');
var events = require('events');
var websocket = require('websocket');

function noop(connection) {
}

var ConnectionManager = (function () {
    function ConnectionManager() {
        this.connectionMap = {};
        this.connectionList = [];
        this.onAdd = noop;
        this.onRemove = noop;
    }
    ConnectionManager.prototype.add = function (connection) {
        var address = connection.address;
        if (address in this.connectionMap)
            return false;

        this.connectionMap[address] = connection;
        this.connectionList.push(connection);

        this.onAdd(connection);
        return true;
    };

    ConnectionManager.prototype.remove = function (connection) {
        var address = connection.address;

        var mappedConnection = this.connectionMap[address];
        if (!mappedConnection || mappedConnection !== connection)
            return false;

        delete this.connectionMap[address];

        var index = this.connectionList.indexOf(connection);
        this.connectionList.splice(index, 1);

        this.onRemove(connection);
        return true;
    };
    return ConnectionManager;
})();

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
    };
    Server.DEFAULT_PORT = 20500;
    return Server;
})();

// constructor function
Server.create = function (options) {
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

    var connectionManager = new ConnectionManager();

    var server = new Server(options.wsServer, connectionManager);
    return server.getApi();
};

Server.prototype.getApi = function () {
    var api = {};

    api.on = this.emitter.on.bind(this.emitter);
    api.removeListener = this.emitter.removeListener.bind(this.emitter);

    Object.defineProperty(api, 'connections', {
        get: this.peers.get.bind(this.peers)
    });

    return api;
};

Server.prototype.connectionHandler = function (request) {
    var address = uuid.v4(), peers = this.peers, peer = Connection.create(address, this.peers, request.accept(PROTOCOL_NAME, request.origin));

    peers.add(peer);

    peer.on('close', function () {
        peers.remove(peer);
    });
};
//# sourceMappingURL=server.js.map
