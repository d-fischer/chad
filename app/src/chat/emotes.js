'use strict';

const JSONPRequest = require('../request/jsonp');
const RegexDictionary = require('../regex/dictionary');

const events = require('./events');

let _ownSubEmotes = [];

class ChatEmotes {
    static getOwnSubEmotes() {
        return _ownSubEmotes;
    }
}

events.on('emotesets', sets => {
    (new JSONPRequest(`https://api.twitch.tv/kraken//chat/emoticon_images?emotesets=${sets}`, (data, success) => {
        if (success) {
            _ownSubEmotes = {};
            for (let emoteSet in data.emoticon_sets) {
                for (let emote of data.emoticon_sets[emoteSet]) {
                    for (let emoteName of RegexDictionary.getAllMatches(emote.code)) {
                        _ownSubEmotes[emoteName] = emote.id;
                    }
                }
            }
        }
    })).call();
});

module.exports = ChatEmotes;