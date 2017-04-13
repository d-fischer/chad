'use strict';

const {EventEmitter} = require('events');

const twitchAPIRequest = require('api/twitchAPI').request;
const userIDFetcher = require('api/userIDFetcher');
const request = require('request');
const cache = require('settings/cache');

const chatEvents = require('chat/events');

let channels = {};

class ChatChannel {
    constructor(name, id = null) {
        this._name = name.replace(/^#/, '');
        this._id = id;
        this._shouldJoin = false;
        this._joined = false;
        this._displayName = name;
        this._element = undefined;

        /**
         * @type {Object}
         * @property {number} _id
         */
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
        this.initEvents();
    }

    on(...args) {
        this._internalEvents.on(...args);
    }

    off(...args) {
        this._internalEvents.removeListener(...args);
    }

    initData() {
        this._setData(cache.get(`channel:${this._name}`), true);
        this.updateData();
        this.startAutoUpdate();
        this.updateBttvData();
    }

    initEvents() {
        chatEvents.on('join', (channel, userName, self) => {
            if (self && channel === this.ircName) {
                this._joined = true;
                this._internalEvents.emit('joined');
            }
        });

        chatEvents.on('part', (channel, userName, self) => {
            if (self && channel === this.ircName) {
                this._joined = false;
                this._internalEvents.emit('left');
            }
        });
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

    async getData() {
        if (this._channelData) {
            return this._channelData;
        }

        return await this.updateData();
    }

    async updateData() {
        const id = await this.getId();

        let data = await twitchAPIRequest(`https://api.twitch.tv/kraken/streams/${id}`);
        let oldOnline = this._online;

        if (!data.stream) {
            this._online = false;

            let data = await twitchAPIRequest(`https://api.twitch.tv/kraken/channels/${id}`);
            if (typeof data === 'object') {
                this._setData(data);
                this._internalEvents.emit('updated');
            }
        }
        else if (typeof data === 'object') {
            this._online = true;
            this._setData(data.stream.channel);
            this._internalEvents.emit('updated');
        }

        if (oldOnline === false && this._online) {
            this._internalEvents.emit('online');
        }

        return this._channelData;
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

    get ircName() {
        return '#' + this.name;
    }

    get bttvEmotes() {
        return this._bttvEmotes;
    }

    get shouldJoin() {
        return this._shouldJoin;
    }

    join() {
        this._shouldJoin = true;
        return new Promise((resolve, reject) => {
            if (this._joined) {
                resolve();
                return;
            }
            const chatInterface = require('chat/connection').chatInterface;
            chatInterface.join(this._name).then(resolve, () => {
                // twitch is weird here, we'll still wait for the join event
                this._internalEvents.once('joined', resolve);
                setTimeout(() => {
                    this._internalEvents.removeListener('joined', resolve);
                    reject();
                }, 1000);
            });
        });
    }

    leave() {
        this._internalEvents.emit('leaving');
        this._shouldJoin = false;
        return require('chat/connection').chatInterface.part(this._name);
    }

    say(message) {
        return require('chat/connection').chatInterface.say(this._name, message);
    }

    getId() {
        return new Promise((resolve, reject) => {
            if (this._id) {
                resolve(this._id);
                return;
            }

            userIDFetcher.get(this._name, id => {
                this._id = id;
                resolve(this._id);
            }, reject);
        });
    }

    get logo() {
        return this._channelLogo;
    }

    get displayName() {
        return this._displayName;
    }
}

module.exports = ChatChannel;