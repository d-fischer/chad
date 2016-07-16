'use strict';

const chatEvents = require('./events');
const {EventEmitter} = require('events');

const twitchAPIRequest = require('../request/twitchAPI');
const request = require('request');

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
        this.updateData();
        this.startAutoUpdate();
    }

    startAutoUpdate() {
        if (this._updateTimer) {
            clearInterval(this._updateTimer);
        }
        this._updateTimer = setInterval(() => this.updateData(), this._updateInterval * 60 * 1000);
    }

    updateData() {
        twitchAPIRequest(`https://api.twitch.tv/kraken/streams/${this._name}`, (data, success) => {
            if (success) {
                // this._streamData = data.stream;

                let oldOnline = this._online;

                if (!data.stream) {
                    this._online = false;

                    twitchAPIRequest(`https://api.twitch.tv/kraken/channels/${this._name}`, (data, success) => {
                        if (success) {
                            this._channelData = data;
                            this._channelLogo = data.logo || this._channelLogo;
                            this._displayName = data.display_name;
                            this._gameName = data.game || '';
                            this._statusText = data.status || '';

                            this._internalEvents.emit('updated');
                        }
                    });
                }
                else {
                    this._online = true;

                    let channelData = data.stream.channel;
                    this._channelData = channelData;
                    this._channelLogo = channelData.logo || this._channelLogo;
                    this._displayName = channelData.display_name;
                    this._gameName = channelData.game || '';
                    this._statusText = channelData.status || '';

                    this._internalEvents.emit('updated');
                }

                if (oldOnline === false && this._online) {
                    this._internalEvents.emit('online');
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
        return require('./connection').chatInterface.part(this._name);
    }

    say(message) {
        return require('./connection').chatInterface.say(this._name, message);
    }
}

module.exports = ChatChannel;