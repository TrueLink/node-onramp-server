import connection = require("./connection")
import events = require("events");

function noop(connection: connection.API): void {
}

export class ConnectionManager {
    private connectionMap: { [address: string]: connection.API; } = {};
    private connectionList: Array<connection.API> = [];

    private emitter: events.EventEmitter;

    public on(event: string, listener: (conn: connection.API) => void) { }
    public off(event: string, listener: (conn: connection.API) => void) { }

    constructor() {
        this.emitter = new events.EventEmitter();
        this.on = this.emitter.on.bind(this.emitter);
        this.off = this.emitter.removeListener.bind(this.emitter);
    }

    public get(): Array<connection.API>;
    public get(address: string): connection.API;
    public get(address?: string): any {
        if (address === undefined) {
            return this.connectionList.slice();
        }

        return this.connectionMap[address];
    }

    public add(connection: connection.API) {
        var address = connection.address;
        if (address in this.connectionMap) return false;

        this.connectionMap[address] = connection;
        this.connectionList.push(connection);

        this.emitter.emit("added", connection);
        return true;
    }

    public remove(connection: connection.API) {
        var address = connection.address;

        var mappedConnection = this.connectionMap[address];
        if (!mappedConnection || mappedConnection !== connection) return false;

        delete this.connectionMap[address];

        var index = this.connectionList.indexOf(connection);
        this.connectionList.splice(index, 1);

        this.emitter.emit("removed", connection);
        return true;
    }
}