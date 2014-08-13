import app = require('commander');
import server = require('./server');

app.version('0.2.0');

app.option('-h, --host [host]', 'The host of the onramp server');

app.parse(process.argv);

var host = app["host"];

var onramp = server.Server.create({host: host});

onramp.on('connection', function(connection){
	console.log('new connection: ' + connection.address);
	onramp.connections.forEach(function(other){
		if(other === connection) return;
			
		connection.send(other.address);
		other.send(connection.address);
	});
});
