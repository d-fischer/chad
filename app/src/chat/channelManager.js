'use strict';

const ChatChannel = require('chat/channel');
const {EventEmitter} = require('events');

class ChatChannelManager extends EventEmitter {
    constructor() {
        super();
        this._channels = {};
    }

    get(channelName) {
        return this._channels[channelName];
    }

    add(channelName) {
        let channel = new ChatChannel(channelName);
        this._channels[channelName] = channel;
        this.emit('channel-added', channelName);
        // do nothing on error - twitch is weird about responding to joins
        channel.join().then(undefined, () => {});
    }

    getAll() {
        return Object.assign({}, this._channels);
    }

    getAllNames() {
        return Object.keys(this._channels);
    }

    has(channelName) {
        return channelName in this._channels;
    }

    addAll(channelNames) {
        for (let channelName of channelNames) {
            this.add(channelName);
        }
    }

    remove(channelName) {
        this._channels[channelName].leave().then(() => {
            delete this._channels[channelName];
        });
    }
}

module.exports = new ChatChannelManager;