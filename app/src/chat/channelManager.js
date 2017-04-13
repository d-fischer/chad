'use strict';

const ChatChannel = require('chat/channel');
const {EventEmitter} = require('events');

class ChatChannelManager extends EventEmitter {
    constructor() {
        super();

        /**
         * List of managed channels
         *
         * @type {Object.<string, ChatChannel>}
         * @private
         */
        this._channels = {};
    }

    /**
     * @param {string} channelName
     * @param {?number} channelId
     * @returns {ChatChannel}
     */
    get(channelName, channelId = null) {
        if (!this._channels.hasOwnProperty(channelName)) {
            this._channels[channelName] = new ChatChannel(channelName, channelId);
        }
        return this._channels[channelName];
    }

    /**
     * @returns {Object.<string, ChatChannel>}
     */
    getAll() {
        return this._channels;
    }

    has(channelName) {
        return channelName in this._channels;
    }

    joinAll(channelNames) {
        // catch all promises even if failing to join
        return Promise.all(channelNames.map(channel => this.get(channel).join().catch(e => e)));
    }
}

module.exports = new ChatChannelManager;