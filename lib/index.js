var app = require("commander");
var server = require("./server");

app.version('0.2.0');

app.option('-h, --host [host]', 'The host of the onramp server');

app.parse(process.argv);

var host = app["host"];

var onramp = server.Server.create({ host: host });

onramp.onConnected.on(function (conn) {
    console.log('peer connected: ' + conn.address);
    onramp.connections.forEach(function (other) {
        conn.connected(other.address);
        other.connected(conn.address);
    });
});

onramp.onConnected.on(function (conn) {
    console.log('peer disconnected: ' + conn.address);
    onramp.connections.forEach(function (other) {
        other.disconnected(conn.address);
    });
});
//# sourceMappingURL=index.js.map
