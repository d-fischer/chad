'use strict';

class ChatMessage {
    constructor(text, emotes) {
        this._text = text;
        this._emotes = emotes;
    }

    parseInto(elem) {
        let text = this._text;
        let emotes = this._emotes;
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
                    emotesByStart[+start] = { start: +start, end: +end + 1, id: emoteId };
                }
            }
        }

        starts.sort((a, b) => a - b);

        for (let emoteStart of starts) {
            let emote = emotesByStart[emoteStart];

            if (currentPosition < emoteStart) {
                elem.appendChild(document.createTextNode(text.substring(currentPosition, emote.start)));
            }
            let img = document.createElement('img');
            img.classList.add('emote');

            img.src = 'http://static-cdn.jtvnw.net/emoticons/v1/' + emote.id + '/1.0';
            img.setAttribute('srcset', 'http://static-cdn.jtvnw.net/emoticons/v1/' + emote.id + '/2.0 2x');
            img.setAttribute('alt', text.substring(emote.start, emote.end));
            elem.appendChild(img);

            currentPosition = emote.end;
        }

        if (currentPosition < length) {
            elem.appendChild(document.createTextNode(text.substring(currentPosition, length)));
        }
    }
}

module.exports = ChatMessage;