'use strict';

const {EventEmitter} = require('events');
const isRenderer = require('is-electron-renderer');

const MessageEvent = require('plugin/event/message');

const pluginManager = require('plugin/manager');

class PluginEvents {
    constructor() {
        this._events = {};
        this._emitter = new EventEmitter;
    }

    handle(eventName, ...args) {
        let evt = this._makeEvent(eventName, ...args);

        if (evt) {
            let handlerMethod = this._getHandlerMethod(eventName);
            if (handlerMethod) {
                let plugins = pluginManager.getAll();
                for (let pluginName in plugins) {
                    if (plugins.hasOwnProperty(pluginName)) {
                        let plugin = plugins[pluginName].getPlugin();
                        if (handlerMethod in plugin) {
                            plugin[handlerMethod].call(plugin, evt);
                        }
                    }
                }
            }
        }
    }

    //noinspection JSMethodCanBeStatic
    _makeEvent(eventName, ...args) {
        switch (eventName) {
            case 'chat':
            case 'action':
            case 'resubmsg':
            case 'cheer': {
                return new MessageEvent(eventName, ...args);
            }
        }

        return null;
    }

    //noinspection JSMethodCanBeStatic
    _getHandlerMethod(eventName) {
        switch (eventName) {
            case 'chat':
            case 'action':
            case 'resubmsg':
            case 'cheer': {
                return 'handleMessage';
            }
        }

        return null;
    }
}

PluginEvents.prototype.on = PluginEvents.prototype.addEventListener;

module.exports = new PluginEvents;

if (!isRenderer) {
    const chatEvents = require('chat/events');

    chatEvents.on('chat', (channelName, userData, message, self) =>
        module.exports.handle('chat', channelName, message, userData, undefined));

    chatEvents.on('action', (channelName, userData, message, self) =>
        module.exports.handle('action', channelName, message, userData, undefined));

    chatEvents.on('resubmsg', (channelName, userData, message, self) =>
        module.exports.handle('resubmsg', channelName, message, userData, undefined));

    chatEvents.on('cheer', (channelName, userData, message, self) =>
        module.exports.handle('cheer', channelName, message, userData, undefined));
}
