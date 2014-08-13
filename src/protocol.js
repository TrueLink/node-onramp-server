var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
exports.name = "rampage";

exports.MESSAGE_TYPE_PLAIN = 0;

exports.MESSAGE_TYPE_RELAY = 10;
exports.MESSAGE_TYPE_RELAYED = 11;

exports.MESSAGE_TYPE_RTC_OFFER = 20;
exports.MESSAGE_TYPE_RTC_ANSWER = 21;
exports.MESSAGE_TYPE_RTC_ICE_CANDIDATE = 22;

function parse(plain) {
    var type = plain["type"];
    switch (type) {
        case exports.MESSAGE_TYPE_PLAIN:
            return new PlainMessage(plain);
        case exports.MESSAGE_TYPE_PLAIN:
            return new PlainMessage(plain);
        case exports.MESSAGE_TYPE_PLAIN:
            return new PlainMessage(plain);
        default:
            throw TypeError("Invalid message type " + type);
    }
}
exports.parse = parse;

function plain(message) {
    return new PlainMessage({ type: exports.MESSAGE_TYPE_PLAIN, content: message });
}
exports.plain = plain;

function relay(address, message) {
    return new RelayMessage({ type: exports.MESSAGE_TYPE_RELAY, address: address, content: message });
}
exports.relay = relay;

function relayed(address, message) {
    return new RelayedMessage({ type: exports.MESSAGE_TYPE_RELAYED, address: address, content: message });
}
exports.relayed = relayed;

// _________________________________________________________________________ //
var Message = (function () {
    function Message(options) {
        this._type = options["type"];
    }
    Object.defineProperty(Message.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });

    Message.prototype.getData = function () {
        throw new TypeError("Abstract method");
    };
    return Message;
})();
exports.Message = Message;

var PlainMessage = (function (_super) {
    __extends(PlainMessage, _super);
    function PlainMessage(options) {
        _super.call(this, options);
        this._content = options["content"];
    }
    Object.defineProperty(PlainMessage.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });

    PlainMessage.prototype.getData = function () {
        return JSON.stringify({
            "type": this.type,
            "content": this.content
        });
    };
    return PlainMessage;
})(Message);
exports.PlainMessage = PlainMessage;

var RelayMessage = (function (_super) {
    __extends(RelayMessage, _super);
    function RelayMessage(options) {
        _super.call(this, options);
        this._address = options["address"];
        this._content = options["content"];
    }
    Object.defineProperty(RelayMessage.prototype, "address", {
        get: function () {
            return this._address;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(RelayMessage.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });

    RelayMessage.prototype.getData = function () {
        return JSON.stringify({
            "type": this.type,
            "address": this._address,
            "content": this.content
        });
    };
    return RelayMessage;
})(Message);
exports.RelayMessage = RelayMessage;

var RelayedMessage = (function (_super) {
    __extends(RelayedMessage, _super);
    function RelayedMessage(options) {
        _super.call(this, options);
        this._address = options["address"];
        this._content = options["content"];
    }
    Object.defineProperty(RelayedMessage.prototype, "address", {
        get: function () {
            return this._address;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(RelayedMessage.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });

    RelayedMessage.prototype.getData = function () {
        return JSON.stringify({
            "type": this.type,
            "address": this._address,
            "content": this.content
        });
    };
    return RelayedMessage;
})(Message);
exports.RelayedMessage = RelayedMessage;
//# sourceMappingURL=protocol.js.map
