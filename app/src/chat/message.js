'use strict';

const ChatEmotes = require('./emotes');

/** @var RegExp */
const urlRegex = /(https?:\/\/.)?(?:www\.)?[-a-z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-z0-9@:%_+.~#?&/=]*/i;

class ChatMessage {
    constructor(text, channel, self, tagEmotes) {
        this._text = text;
        this._channel = channel;
        this._self = self;
        this._tagEmotes = tagEmotes;
        this._currentText = '';
        this._elem = undefined;
    }

    parseInto(elem) {
        let text = this._text;
        this._elem = elem;
        if (this._self) {
            this.parseTokenized(this._text);
        }
        else {
            let emotes = this._tagEmotes;
            if (!emotes) {
                this.parseTokenized(text);
                return;
            }

            // reverse emotes array
            let currentPosition = 0;
            let length = text.length;
            let emotesByStart = {};
            let starts = [];
            for (let emoteId in emotes) {
                if (emotes.hasOwnProperty(emoteId)) {
                    for (let emoteRange of emotes[emoteId]) {
                        let split = emoteRange.split('-');
                        let start = split[0], end = split[1];
                        starts.push(+start);
                        emotesByStart[+start] = {start: +start, end: +end + 1, id: emoteId};
                    }
                }
            }

            starts.sort((a, b) => a - b);

            for (let emoteStart of starts) {
                let emote = emotesByStart[emoteStart];

                if (currentPosition < emoteStart) {
                    this.parseTokenized(text.substring(currentPosition, emote.start));
                }

                this.appendEmote(emote, text.substring(emote.start, emote.end));
                currentPosition = emote.end;
            }

            if (currentPosition < length) {
                this.parseTokenized(text.substring(currentPosition, length));
            }
        }
    }

    parseTokenized(text) {
        this._currentText = '';
        let words = text.split(' ');
        let word;

        while ((word = words.shift()) !== undefined) {
            this.parseWord(word);
            if (words.length > 0) {
                this._currentText += ' ';
            }
        }
        this.appendCurrentText();
    }

    parseWord(word) {
        let twitchEmotes = ChatEmotes.getOwnTwitchEmotes();
        let bttvEmotes = ChatEmotes.getBttvEmotes(this._channel);
        if (this._self && word in twitchEmotes) {
            this.appendCurrentText();
            this.appendEmote(twitchEmotes[word], word);
        }
        else if (word in bttvEmotes) {
            this.appendCurrentText();
            this.appendBttvEmote(bttvEmotes[word], word);
        }
        else {
            let match;
            while (match = word.match(urlRegex)) {
                this._currentText += word.substr(0, match.index);
                this.appendCurrentText();
                let url = match[0];
                word = word.substr(match.index + url.length);
                if (!match[1]) {
                    url = 'http://' + url;
                }
                let link = document.createElement('a');
                link.classList.add('external-link');
                link.href = url;
                link.textContent = match[0];
                this._elem.appendChild(link);
            }
            this._currentText += word;
        }
    }

    appendCurrentText() {
        if (this._currentText) {
            this._elem.appendChild(document.createTextNode(this._currentText));
            this._currentText = '';
        }
    }

    appendEmote(emote, text) {
        let img = document.createElement('img');
        img.classList.add('emote');

        img.src = `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/1.0`;
        img.setAttribute('srcset', `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/2.0 2x`);
        img.setAttribute('alt', text);
        this._elem.appendChild(img);
    }

    appendBttvEmote(emote, text) {
        let img = document.createElement('img');
        img.classList.add('emote');

        let imgUrl = emote.url.replace(/^\/\//, 'https://');
        img.src = imgUrl;
        let highDpiImgUrl = imgUrl.replace(/\/1x$/, '/2x');
        if (highDpiImgUrl != imgUrl) {
            img.setAttribute('srcset', `${highDpiImgUrl} 2x`);
        }
        img.setAttribute('alt', text);
        if ('width' in emote) {
            img.setAttribute('width', emote.width);
        }
        if ('height' in emote) {
            img.setAttribute('height', emote.height);
        }
        this._elem.appendChild(img);
    }
}

module.exports = ChatMessage;