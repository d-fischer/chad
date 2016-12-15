'use strict';

const UIChannel = require('./channel');

class UIChannelManager {
    constructor() {
        this._channels = {};
    }

    get(channelName) {
        return this._channels[channelName];
    }

    add(channelName) {
        this._channels[channelName] = new UIChannel(channelName);
    }

    getAll() {
        return Object.assign({}, this._channels);
    }

    getAllNames() {
        return Object.keys(this._channels);
    }

    addAll(channelNames) {
        for (let channelName of channelNames) {
            this.add(channelName);
        }
    }

    remove(channelName) {
        this._channels[channelName].destroy();
        delete this._channels[channelName];
    }

    removeAll() {
        for (let channelName in this._channels) {
            if (this._channels.hasOwnProperty(channelName)) {
                this._channels[channelName].destroy();
            }
        }
        this._channels = {};
    }
}

module.exports = new UIChannelManager;