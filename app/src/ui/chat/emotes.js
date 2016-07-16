'use strict';

const remote = require('electron').remote;

const chatEvents = remote.require('./chat/events');

const uiChannelManager = require("../channelManager.js");

const RegexDictionary = require('../../regex/dictionary');
const ObjectTools = require('../../tools/object');
const htmlEntities = new require('html-entities').AllHtmlEntities;

const request = require('request');
const merge = require('merge');

class UIChatEmotes {
    constructor() {
        this._ownTwitchEmotes = {};
        this._globalBttvEmotes = {};
        this.init();
    }

    init() {
        let _this = this;
        chatEvents.on('emotesets', (_, emoteSets) => {
            _this._ownTwitchEmotes = {};
            for (let emoteSet in emoteSets) {
                if (emoteSets.hasOwnProperty(emoteSet)) {
                    for (let emote of emoteSets[emoteSet]) {
                        for (let emoteName of RegexDictionary.getAllMatches(emote.code)) {
                            emoteName = htmlEntities.decode(emoteName);
                            _this._ownTwitchEmotes[emoteName] = emote;
                        }
                    }
                }
            }
        });

        request('https://api.betterttv.net/2/emotes', (error, res, data) => {
            if (!error && res.statusCode === 200) {
                data = JSON.parse(data);
                _this._globalBttvEmotes = ObjectTools.combine(data.emotes.map(emote => emote.code), data.emotes);
            }
        });
    }

    getOwnTwitchEmotes() {
        return this._ownTwitchEmotes;
    }

    getBttvEmotes(channelName) {
        return merge(this._globalBttvEmotes, uiChannelManager.get(channelName).bttvEmotes);
    }
}

module.exports = new UIChatEmotes;