'use strict';

const PluginEvent = require('plugin/event');

class MessageEvent extends PluginEvent {
    constructor(type, channel, line, userState, relatedElement) {
        super();
        this._type = type;
        this._channel = channel;
        this._message = line;
        this._userState = userState;
        this._relatedElement = relatedElement;
    }

    get type() {
        return this._type;
    }

    get channel() {
        return this._channel;
    }

    get message() {
        return this._message;
    }

    //noinspection JSUnusedGlobalSymbols
    get userState() {
        return this._userState;
    }

    //noinspection JSUnusedGlobalSymbols
    get relatedElement() {
        return this._relatedElement;
    }
}

module.exports = MessageEvent;