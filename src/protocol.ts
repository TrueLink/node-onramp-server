// This module should be common for client and server. 

export var name: string = "rampage";

export var MESSAGE_TYPE_PEER_CONNECTED = 1;
export var MESSAGE_TYPE_PEER_DICONNECTED = 2;

export var MESSAGE_TYPE_RELAY = 11;
export var MESSAGE_TYPE_RELAYED = 12;

export var MESSAGE_TYPE_RTC_OFFER = 21;
export var MESSAGE_TYPE_RTC_ANSWER = 22;
export var MESSAGE_TYPE_RTC_ICE_CANDIDATE = 23;


export function parse(plain: any): Message {
    var type = plain["type"];
    switch (type) {
        case MESSAGE_TYPE_PEER_CONNECTED: return new ConnectedMessage(plain);
        case MESSAGE_TYPE_PEER_DICONNECTED: return new DiconnectedMessage(plain);
        case MESSAGE_TYPE_RELAY: return new RelayMessage(plain);
        case MESSAGE_TYPE_RELAYED: return new RelayedMessage(plain);
        default: throw TypeError("Invalid message type " + type);
    }
}

export function connected(peerId: string): ConnectedMessage {
    return new ConnectedMessage({ type: MESSAGE_TYPE_RELAY, peerId: peerId });
}

export function disconnected(peerId: string): DiconnectedMessage {
    return new DiconnectedMessage({ type: MESSAGE_TYPE_RELAY, peerId: peerId });
}

export function relay(peerId: string, message: string): RelayMessage {
    return new RelayMessage({ type: MESSAGE_TYPE_RELAY, peerId: peerId, content: message });
}

export function relayed(peerId: string, message: string): RelayedMessage {
    return new RelayedMessage({ type: MESSAGE_TYPE_RELAYED, peerId: peerId, content: message });
}

// _________________________________________________________________________ //

export class Message {
    public get type(): number {
        return this._type;
    }

    private _type: number;

    constructor(options: any) {
        this._type = options["type"];
    }

    public getData(): string {
        throw new TypeError("Abstract method");
    }
}

export class ConnectedMessage extends Message {
    public get peerId(): string {
        return this._peerId;
    }

    private _peerId: string;

    constructor(options: any) {
        super(options)
        this._peerId = options["peerId"];
    }

    public getData(): string {
        return JSON.stringify({
            "type": this.type,
            "peerId": this._peerId,
        });
    }
}

export class DiconnectedMessage extends Message {
    public get peerId(): string {
        return this._peerId;
    }

    private _peerId: string;

    constructor(options: any) {
        super(options)
        this._peerId = options["peerId"];
    }

    public getData(): string {
        return JSON.stringify({
            "type": this.type,
            "peerId": this._peerId,
        });
    }
}

export class RelayMessage extends Message {
    public get peerId(): string {
        return this._peerId;
    }

    public get content(): string {
        return this._content;
    }

    private _peerId: string;
    private _content: string;

    constructor(options: any) {
        super(options)
        this._peerId = options["peerId"];
        this._content = options["content"];
    }

    public getData(): string {
        return JSON.stringify({
            "type": this.type,
            "peerId": this._peerId,
            "content": this.content,
        });
    }
}

export class RelayedMessage extends Message {
    public get peerId(): string {
        return this._peerId;
    }

    public get content(): string {
        return this._content;
    }

    private _peerId: string;
    private _content: string;

    constructor(options: any) {
        super(options)
        this._peerId = options["peerId"];
        this._content = options["content"];
    }

    public getData(): string {
        return JSON.stringify({
            "type": this.type,
            "peerId": this._peerId,
            "content": this.content,
        });
    }
}