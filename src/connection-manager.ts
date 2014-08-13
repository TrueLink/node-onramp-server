import connection = require("./connection")

function noop(connection: connection.API): void {
}

export class ConnectionManager {
    private connectionMap: { [address: string]: connection.API; } = {};
    private connectionList: Array<connection.API> = [];

    public onAdd: (connection: connection.API) => void = noop;
    public onRemove: (connection: connection.API) => void = noop;

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

        this.onAdd(connection);
        return true;
    }

    public remove(connection: connection.API) {
        var address = connection.address;

        var mappedConnection = this.connectionMap[address];
        if (!mappedConnection || mappedConnection !== connection) return false;

        delete this.connectionMap[address];

        var index = this.connectionList.indexOf(connection);
        this.connectionList.splice(index, 1);

        this.onRemove(connection);
        return true;
    }
}