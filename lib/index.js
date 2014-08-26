var app = require("commander");
var server = require("./server");

app.version('0.2.0');

app.option('-h, --host [host]', 'The host of the onramp server');

app.parse(process.argv);

var host = app["host"];

var onramp = server.Server.create({ host: host });
//# sourceMappingURL=index.js.map
