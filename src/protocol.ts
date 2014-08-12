export var name: string = "rampage";

var MESSAGE_TYPE_PLAIN = 0;

var MESSAGE_TYPE_RELAY = 10;
var MESSAGE_TYPE_RELAYED = 11;

var MESSAGE_TYPE_RTC_OFFER = 20;
var MESSAGE_TYPE_RTC_ANSWER = 21;
var MESSAGE_TYPE_RTC_ICE_CANDIDATE = 22;

export function parse(plain: Object): Message {
    return null;
}

export function plain(text: string): PlainMessage {
    return new PlainMessage(MESSAGE_TYPE_PLAIN, text);
}

export function plain(text: string): PlainMessage {
    return new PlainMessage(MESSAGE_TYPE_PLAIN, text);
}

// _________________________________________________________________________ //

export class Message {
    public get type(): number {
        return this._type;
    }

    private _type: number;

    constructor(type: number) {
        this._type = type;
    }

    public getData(): Object {
        var data = {};

        data["type"] = this._type;

        return data;
    }
}

export class PlainMessage extends Message {
    public get text(): string {
        return this._text;
    }

    private _text: string;

    constructor(type: number, text: string) {
        super(type)
        this._text = text;
    }

    public getData(): Object {
        var data = super.getData();

        data["text"] = this._text;

        return data;
    }
}
