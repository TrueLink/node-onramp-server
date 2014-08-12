var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
exports.name = "rampage";

var MESSAGE_TYPE_PLAIN = 0;

var MESSAGE_TYPE_RELAY = 10;
var MESSAGE_TYPE_RELAYED = 11;

var MESSAGE_TYPE_RTC_OFFER = 20;
var MESSAGE_TYPE_RTC_ANSWER = 21;
var MESSAGE_TYPE_RTC_ICE_CANDIDATE = 22;

function parse(plain) {
    return null;
}
exports.parse = parse;

function plain(text) {
    return new PlainMessage(MESSAGE_TYPE_PLAIN, text);
}
exports.plain = plain;

function plain(text) {
    return new PlainMessage(MESSAGE_TYPE_PLAIN, text);
}
exports.plain = plain;

// _________________________________________________________________________ //
var Message = (function () {
    function Message(type) {
        this._type = type;
    }
    Object.defineProperty(Message.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });

    Message.prototype.getData = function () {
        var data = {};

        data["type"] = this._type;

        return data;
    };
    return Message;
})();
exports.Message = Message;

var PlainMessage = (function (_super) {
    __extends(PlainMessage, _super);
    function PlainMessage(type, text) {
        _super.call(this, type);
        this._text = text;
    }
    Object.defineProperty(PlainMessage.prototype, "text", {
        get: function () {
            return this._text;
        },
        enumerable: true,
        configurable: true
    });

    PlainMessage.prototype.getData = function () {
        var data = _super.prototype.getData.call(this);

        data["text"] = this._text;

        return data;
    };
    return PlainMessage;
})(Message);
exports.PlainMessage = PlainMessage;
//# sourceMappingURL=protocol.js.map
