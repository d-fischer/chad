'use strict';

const {EventEmitter} = require('events');

const MessageEvent = require('./event/message');

class PluginEvents {
    constructor() {
        this._events = {};
        this._catchEvents = {};
        this._emitter = new EventEmitter;
        this._catchEmitter = new EventEmitter;
    }

    addEventListener(eventName, module, listener) {
        return this._addEventListener(false, eventName, module, listener);
    }

    addCatchingEventListener(eventName, module, listener) {
        return this._addEventListener(true, eventName, module, listener);
    }

    _addEventListener(catching, eventName, pluginName, listener) {
        let emitter = catching ? this._catchEmitter : this._emitter;
        let events = catching ? this._catchEvents : this._events;
        if (typeof pluginName === 'function') {
            listener = pluginName;
        }

        if (!(eventName in events)) {
            events[eventName] = {};
        }

        if (!(pluginName in events[eventName])) {
            events[eventName][pluginName] = [];
        }

        events[eventName][pluginName].push(listener);
        emitter.on(eventName, listener);

        return this;
    }

    handle(eventName, ...args) {
        let catchingEvents = this._catchEvents[eventName];
        let events = this._events[eventName];
        let evt = this._makeEvent(eventName, ...args);

        if (catchingEvents) {
            for (let pluginName in catchingEvents) {
                if (catchingEvents.hasOwnProperty(pluginName)) {
                    for (let handler of catchingEvents[pluginName]) {
                        try {
                            handler.call(this, evt);
                        }
                        catch (e) {
                            console.log(`Uncaught exception in plugin ${pluginName}:`, e);
                        }
                    }
                }
            }
        }

        // can't overwrite that anymore after this
        let wasCaught = evt.caught;

        if (!wasCaught) {
            for (let pluginName in events) {
                if (events.hasOwnProperty(pluginName)) {
                    for (let handler of events[pluginName]) {
                        try {
                            handler.call(this, evt);
                        }
                        catch (e) {
                            console.log(`Uncaught exception in plugin ${pluginName}:`, e);
                        }
                    }
                }
            }
        }

        return wasCaught;
    }

    _makeEvent(eventName, ...args) {
        switch (eventName) {
            case 'message': {
                return new MessageEvent(...args);
            }
        }
    }

    _removeAllForPlugin(pluginName) {
        for (let eventName in this._events) {
            if (this._events.hasOwnProperty(eventName) && pluginName in this._events[eventName]) {
                this._events[eventName][pluginName].forEach(handler => this._emitter.removeListener(eventName, handler));
                delete this._events[eventName][pluginName];
            }
        }

        for (let eventName in this._catchEvents) {
            if (this._catchEvents.hasOwnProperty(eventName) && pluginName in this._catchEvents[eventName]) {
                this._catchEvents[eventName][pluginName].forEach(handler => this._catchEmitter.removeListener(eventName, handler));
                delete this._catchEvents[eventName][pluginName];
            }
        }
    }
}

PluginEvents.prototype.on = PluginEvents.prototype.addEventListener;
PluginEvents.prototype.catchEvent = PluginEvents.prototype.addCatchingEventListener;

module.exports = new PluginEvents;

const chatEvents = require('../chat/events');

chatEvents.on('chat', (channelName, userData, message, self) =>
    module.exports.handle('message', channelName, message, userData, undefined));