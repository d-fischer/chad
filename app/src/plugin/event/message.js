'use strict';

const PluginEvent = require('plugin/event');

class MessageEvent extends PluginEvent {
    constructor(channel, line, userState, relatedElement) {
        super();
        this._channel = channel;
        this._message = line;
        this._userState = userState;
        this.withRelatedElement = fn => fn(relatedElement);
    }

    get channel() {
        return this._channel;
    }

    get message() {
        return this._message;
    }

    get userState() {
        return this._userState;
    }
}

module.exports = MessageEvent;