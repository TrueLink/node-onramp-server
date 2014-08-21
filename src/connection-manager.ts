// This module should be common for client and server. 

export interface EventEmitter {
    on(event: string, listener: Function): EventEmitter;
    removeListener(event: string, listener: Function): EventEmitter;
    emit(event: string, ...args: any[]): boolean;
}

export interface EventEmitterFactory {
    new (): EventEmitter;
}

export interface IConnection {
    address: string;
}

function noop(connection: IConnection): void {
}

export class ConnectionManager<T extends IConnection> {
    private connectionMap: { [address: string]: T; } = {};
    private connectionList: Array<T> = [];

    private emitter: EventEmitter;

    static EventEmitter: EventEmitterFactory;

    public on(event: string, listener: (conn: T) => void) { }
    public off(event: string, listener: (conn: T) => void) { }

    constructor() {
        this.emitter = new ConnectionManager.EventEmitter();
        this.on = this.emitter.on.bind(this.emitter);
        this.off = this.emitter.removeListener.bind(this.emitter);
    }

    public get(): Array<T>;
    public get(address: string): T;
    public get(address?: string): any {
        if (address === undefined) {
            return this.connectionList.slice();
        }

        return this.connectionMap[address];
    }

    public add(connection: T) {
        var address = connection.address;
        if (address in this.connectionMap) return false;

        this.connectionMap[address] = connection;
        this.connectionList.push(connection);

        this.emitter.emit("added", connection);
        return true;
    }

    public remove(connection: T) {
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