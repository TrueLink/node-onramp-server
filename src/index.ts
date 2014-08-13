import app = require("commander");
import server = require("./server");
import connection = require("./connection");

app.version('0.2.0');

app.option('-h, --host [host]', 'The host of the onramp server');

app.parse(process.argv);

var host = (<any>app)["host"];

var onramp = server.Server.create({host: host});

onramp.on('connection', function(conn: connection.API) {
    console.log('new connection: ' + conn.address);
    onramp.connections.forEach(function(other){
        if (other === conn) return;
            
        conn.send(other.address);
        other.send(conn.address);
    });
});
