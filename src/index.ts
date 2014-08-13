﻿import app = require('commander');
import Onramp = require('../');
	
app.version('0.2.0')	

app.option('-h, --host [host]', 'The host of the onramp server');

app.parse(process.argv);

(function main(){
	var host = app.host;

	// Create the onramp instance at the localhost
	var onramp = Onramp.create({host: host});

	configureBroadcast(onramp);
}());

function configureBroadcast(onramp){
	// Whenever a connection is established, tell it about all the 
	// other connections available, and then broadcast it's connection
	// identifier to the rest of the connections so everyone always
	// knows who is connected to the onramp
	onramp.on('connection', function(connection){
		console.log('new connection: ' + connection.address);
		onramp.connections.forEach(function(other){
			if(other === connection) return;
			
			connection.send(other.address);
			other.send(connection.address);
		});
	});
}