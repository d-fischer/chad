'use strict';

const {EventEmitter} = require('events');

const twitchAPIRequest = require('../request/twitchAPI').request;
const request = require('request');
const cache = require('../settings/cache');

let channels = {};

class ChatChannel {
    constructor(name) {
        this._name = name;
        this._displayName = name;
        this._element = undefined;
        this._channelData = undefined;
        this._bttvEmotes = {};
        this._channelLogo = 'img/default-user.svg';
        this._gameName = '';
        this._statusText = '';
        this._online = undefined;
        this._updateTimer = undefined;
        this._updateInterval = 10;
        this._internalEvents = new EventEmitter();
        this.initData();
    }

    on(...args) {
        this._internalEvents.on(...args);
    }

    off(...args) {
        this._internalEvents.removeListener(...args);
    }

    initData() {
        this._setData(cache.get(`channel:${this._name}`));
        this.updateData();
        this.startAutoUpdate();
        this.updateBttvData();
    }

    startAutoUpdate() {
        if (this._updateTimer) {
            clearInterval(this._updateTimer);
        }
        this._updateTimer = setInterval(() => this.updateData(), this._updateInterval * 60 * 1000);
    }

    _setData(data, fromCache = false) {
        if (data) {
            this._channelData = data;
            this._channelLogo = data.logo || this._channelLogo;
            this._displayName = data.display_name || this._name;
            this._gameName = data.game || '';
            this._statusText = data.status || '';

            if (!fromCache) {
                cache.set(`channel:${this._name}`, data);
            }
        }
    }

    updateData() {
        twitchAPIRequest(`https://api.twitch.tv/kraken/streams/${this._name}`, (data, success) => {
            if (success) {
                let oldOnline = this._online;

                if (!data.stream) {
                    this._online = false;

                    twitchAPIRequest(`https://api.twitch.tv/kraken/channels/${this._name}`, (data, success) => {
                        if (success && typeof data === 'object') {
                            this._setData(data);
                            this._internalEvents.emit('updated');
                        }
                    });
                }
                else if (typeof data === 'object') {
                    this._online = true;
                    this._setData(data.stream.channel);
                    this._internalEvents.emit('updated');
                }

                if (oldOnline === false && this._online) {
                    this._internalEvents.emit('online');
                }
            }
        });
    }

    updateBttvData() {
        request(`https://api.betterttv.net/2/channels/${this._name}`, (err, res, data) => {
            if (!err && res.statusCode === 200) {
                data = JSON.parse(data);
                this._bttvEmotes = {};
                for (let emote of data.emotes) {
                    this._bttvEmotes[emote.code] = emote;
                }
            }
        });
    }

    get name() {
        return this._name;
    }

    get bttvEmotes() {
        return this._bttvEmotes;
    }

    join() {
        return require('./connection').chatInterface.join(this._name);
    }

    leave() {
        this._internalEvents.emit('leaving');
        return require('./connection').chatInterface.part(this._name);
    }

    say(message) {
        return require('./connection').chatInterface.say(this._name, message);
    }
}

module.exports = ChatChannel;