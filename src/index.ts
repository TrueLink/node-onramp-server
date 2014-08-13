import app = require("commander");
import server = require("./server");
import connection = require("./connection");

app.version('0.2.0');

app.option('-h, --host [host]', 'The host of the onramp server');

app.parse(process.argv);

var host = (<any>app)["host"];

var onramp = server.Server.create({host: host});

onramp.on('connection', function(conn: connection.API) {
    console.log('peer connected: ' + conn.address);
    onramp.connections.forEach(function(other){
        conn.connected(other.address);
        other.connected(conn.address);
    });
});

onramp.on('disconnection', function (conn: connection.API) {
    console.log('peer disconnected: ' + conn.address);
    onramp.connections.forEach(function (other) {
        other.disconnected(conn.address);
    });
});
