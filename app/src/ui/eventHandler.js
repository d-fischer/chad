'use strict';

class UIEventHandler {
    constructor(emitter) {
        this._emitter = emitter;
        this._events = {};
    }

    bindEventHandler(type, handler) {
        this._emitter.on(type, handler);
        if (!this._events.hasOwnProperty(type)) {
            this._events[type] = [];
        }
        this._events[type].push(handler);
    }

    removeEventHandlers(type) {
        if (type === undefined) {
            for (let name in this._events) {
                if (this._events.hasOwnProperty(name)) {
                    this.removeEventHandlers(name);
                }
            }
        }
        else {
            for (let handler of this._events[type]) {
                this._emitter.removeListener(type, handler);
            }

            delete this._events[type];
        }
    }
}

module.exports = UIEventHandler;