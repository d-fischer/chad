'use strict';

const JSONPRequest = require('../request/jsonp');
const RegexDictionary = require('../regex/dictionary');

const events = require('./events');

let _ownSubEmotes = [];
let domParser = new DOMParser();

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
                if (data.emoticon_sets.hasOwnProperty(emoteSet)) {
                    for (let emote of data.emoticon_sets[emoteSet]) {
                        for (let emoteName of RegexDictionary.getAllMatches(emote.code)) {
                            emoteName = domParser.parseFromString(emoteName, 'text/html').documentElement.textContent;
                            _ownSubEmotes[emoteName] = emote.id;
                        }
                    }
                }
            }
        }
    })).call();
});

module.exports = ChatEmotes;