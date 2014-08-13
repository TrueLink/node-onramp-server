export var name: string = "rampage";

export var MESSAGE_TYPE_PLAIN = 0;

export var MESSAGE_TYPE_RELAY = 10;
export var MESSAGE_TYPE_RELAYED = 11;

export var MESSAGE_TYPE_RTC_OFFER = 20;
export var MESSAGE_TYPE_RTC_ANSWER = 21;
export var MESSAGE_TYPE_RTC_ICE_CANDIDATE = 22;


export function parse(plain: any): Message {
    var type = plain["type"];
    switch (type) {
        case MESSAGE_TYPE_PLAIN: return new PlainMessage(plain);
        case MESSAGE_TYPE_PLAIN: return new PlainMessage(plain);
        case MESSAGE_TYPE_PLAIN: return new PlainMessage(plain);
        default: throw TypeError("Invalid message type " + type);
    }
}

export function plain(message: string): PlainMessage {
    return new PlainMessage({ type: MESSAGE_TYPE_PLAIN, content: message });
}

export function relay(address: string, message: string): RelayMessage {
    return new RelayMessage({ type: MESSAGE_TYPE_RELAY, address: address, content: message });
}

export function relayed(address: string, message: string): RelayedMessage {
    return new RelayedMessage({ type: MESSAGE_TYPE_RELAYED, address: address, content: message });
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

export class PlainMessage extends Message {
    public get content(): string {
        return this._content;
    }

    private _content: string;

    constructor(options: any) {
        super(options)
        this._content = options["content"];
    }

    public getData(): string {
        return JSON.stringify({
            "type": this.type,
            "content": this.content,
        });
    }
}

export class RelayMessage extends Message {
    public get address(): string {
        return this._address;
    }

    public get content(): string {
        return this._content;
    }

    private _address: string;
    private _content: string;

    constructor(options: any) {
        super(options)
        this._address = options["address"];
        this._content = options["content"];
    }

    public getData(): string {
        return JSON.stringify({
            "type": this.type,
            "address": this._address,
            "content": this.content,
        });
    }
}

export class RelayedMessage extends Message {
    public get address(): string {
        return this._address;
    }

    public get content(): string {
        return this._content;
    }

    private _address: string;
    private _content: string;

    constructor(options: any) {
        super(options)
        this._address = options["address"];
        this._content = options["content"];
    }

    public getData(): string {
        return JSON.stringify({
            "type": this.type,
            "address": this._address,
            "content": this.content,
        });
    }
}