'use strict';

const emotes = require('./emotes');

class ChatMessage {
    constructor(text, tagEmotes) {
        this._text = text;
        this._tagEmotes = tagEmotes;
        this._ownSubEmotes = emotes.getOwnSubEmotes();
        this._currentText = '';
    }

    parseInto(elem, self) {
        let text = this._text;
        if (self) {
            this.parseTokenized(elem, this._text);
        }
        else {
            let emotes = this._tagEmotes;
            if (!emotes) {
                elem.textContent = text;
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
                    elem.appendChild(document.createTextNode(text.substring(currentPosition, emote.start)));
                }

                this.appendEmote(elem, emote.id, text.substring(emote.start, emote.end));
                currentPosition = emote.end;
            }

            if (currentPosition < length) {
                elem.appendChild(document.createTextNode(text.substring(currentPosition, length)));
            }
        }
    }

    parseTokenized(elem, text) {
        let words = text.split(' ');
        let word;

        while (word = words.shift()) {
            this.parseWord(elem, word);
            if (words.length > 0) {
                this._currentText += ' ';
            }
        }
        this.appendCurrentText(elem);
    }

    parseWord(elem, word) {
        if (word in this._ownSubEmotes) {
            this.appendCurrentText(elem);
            this.appendEmote(elem, this._ownSubEmotes[word], word);
        }
        else {
            this._currentText += word;
        }
    }

    appendCurrentText(elem) {
        if (this._currentText) {
            elem.appendChild(document.createTextNode(this._currentText));
            this._currentText = '';
        }
    }

    appendEmote(elem, id, text) {
        let img = document.createElement('img');
        img.classList.add('emote');

        img.src = 'http://static-cdn.jtvnw.net/emoticons/v1/' + id + '/1.0';
        img.setAttribute('srcset', 'http://static-cdn.jtvnw.net/emoticons/v1/' + id + '/2.0 2x');
        img.setAttribute('alt', text);
        elem.appendChild(img);
    }
}

module.exports = ChatMessage;