'use strict';

const JSONPRequest = require('../request/jsonp');
const RegexDictionary = require('../regex/dictionary');
const ObjectTools = require('../tools/object');

const ChatChannel = require('./channel');

const chatEvents = require('./events');

const request = require('request');
const merge = require('merge');

let _ownTwitchEmotes = {};
let _globalBttvEmotes = {};
let domParser = new DOMParser();

class ChatEmotes {
    static getOwnTwitchEmotes() {
        return _ownTwitchEmotes;
    }

    static getBttvEmotes(channel) {
        return merge(_globalBttvEmotes, channel.bttvEmotes);
    }
}

chatEvents.on('emotesets', sets => {
    (new JSONPRequest(`https://api.twitch.tv/kraken/chat/emoticon_images?emotesets=${sets}`, (data, success) => {
        if (success) {
            _ownTwitchEmotes = {};
            for (let emoteSet in data.emoticon_sets) {
                if (data.emoticon_sets.hasOwnProperty(emoteSet)) {
                    for (let emote of data.emoticon_sets[emoteSet]) {
                        for (let emoteName of RegexDictionary.getAllMatches(emote.code)) {
                            emoteName = domParser.parseFromString(emoteName, 'text/html').documentElement.textContent;
                            _ownTwitchEmotes[emoteName] = emote;
                        }
                    }
                }
            }
        }
    })).call();
});

chatEvents.on('logon', () => {
    request('https://api.betterttv.net/emotes', (error, res, data) => {
        if (!error && res.statusCode === 200) {
            data = JSON.parse(data);
           _globalBttvEmotes = ObjectTools.combine(data.emotes.map(emote => emote.regex), data.emotes);
        }
    });
});

module.exports = ChatEmotes;