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
        let channel = new UIChannel(channelName);
        this._channels[channelName] = channel;
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
}

module.exports = new UIChannelManager;