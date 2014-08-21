// This module should be common for client and server.

function noop(connection) {
}

var ConnectionManager = (function () {
    function ConnectionManager() {
        this.connectionMap = {};
        this.connectionList = [];
        this.emitter = new ConnectionManager.EventEmitter();
        this.on = this.emitter.on.bind(this.emitter);
        this.off = this.emitter.removeListener.bind(this.emitter);
    }
    ConnectionManager.prototype.on = function (event, listener) {
    };
    ConnectionManager.prototype.off = function (event, listener) {
    };

    ConnectionManager.prototype.get = function (address) {
        if (address === undefined) {
            return this.connectionList.slice();
        }

        return this.connectionMap[address];
    };

    ConnectionManager.prototype.add = function (connection) {
        var address = connection.address;
        if (address in this.connectionMap)
            return false;

        this.connectionMap[address] = connection;
        this.connectionList.push(connection);

        this.emitter.emit("added", connection);
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

        this.emitter.emit("removed", connection);
        return true;
    };
    return ConnectionManager;
})();
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connection-manager.js.map
