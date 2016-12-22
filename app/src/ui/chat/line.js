'use strict';

const ChatUser = require('./../../chat/user');

const {remote} = require('electron');
const chatEmotes = remote.require('./chat/emotes');

const TinyColor = require('tinycolor2');

/** @var RegExp */
const _urlRegex = /(https?:\/\/)?(?:www\.)?(?:(?:[-a-z0-9@:%_+~#=])+\.)+[a-z]{2,6}\b[-a-z0-9@:%_+.~#?&/=]*/i;

const _cheerEmotes = {
    1: {
        image: "gray",
        color: "#979797"
    },
    100: {
        image: "purple",
        color: "#9c3ee8"
    },
    1e3: {
        image: "green",
        color: "#1db2a5"
    },
    5e3: {
        image: "blue",
        color: "#0099fe"
    },
    1e4: {
        image: "red",
        color: "#f43021"
    }
};

const _cheerTypes = ['cheer', 'kappa', 'kreygasm', 'swiftrage', 'muxy', 'streamlabs'];
const _cheerAlternation = _cheerTypes.join('|');

class UIChatLine {
    constructor(text, channel, userState, self, time) {
        this._channel = channel;
        this._self = self;
        this._userState = userState;
        this._user = new ChatUser(userState);
        this._text = text;
        this._textElem = undefined;
        this._time = time || new Date();
    }

    get isCheer() {
        return this._userState['message-type'] === 'cheer';
    }

    get isAction() {
        return this._userState['message-type'] === 'action';
    }

    parse() {
        let userColor = UIChatLine._adjustColor(this._user.color);

        let lineFrag = document.getElementById('chat-message-template').content.cloneNode(true);
        let timePart = lineFrag.querySelector('time');
        timePart.setAttribute('datetime', this._time.toISOString());
        timePart.appendChild(document.createTextNode(this._time.toLocaleTimeString()));

        let badgesPart = lineFrag.querySelector('.badges');

        if (this._user.isBroadcaster) {
            let modBadge = document.createElement('i');
            modBadge.classList.add('badge', 'broadcaster');
            badgesPart.appendChild(modBadge);
        }
        else if (this._user.isStaff) {
            let modBadge = document.createElement('i');
            modBadge.classList.add('badge', 'staff');
            badgesPart.appendChild(modBadge);
        }
        else if (this._user.isAdmin) {
            let modBadge = document.createElement('i');
            modBadge.classList.add('badge', 'admin');
            badgesPart.appendChild(modBadge);
        }
        else if (this._user.isGlobalMod) {
            let modBadge = document.createElement('i');
            modBadge.classList.add('badge', 'global-moderator');
            badgesPart.appendChild(modBadge);
        }
        else if (this._user.isModerator) {
            let modBadge = document.createElement('i');
            modBadge.classList.add('badge', 'moderator');
            badgesPart.appendChild(modBadge);
        }

        if (this._user.subLevel) {
            let subBadge = document.createElement('i');
            subBadge.classList.add('badge', `sub-${this._user.subLevel}`);
            badgesPart.appendChild(subBadge);
        }

        if (this._user.isPrime) {
            let primeBadge = document.createElement('i');
            primeBadge.classList.add('badge', 'prime');
            badgesPart.appendChild(primeBadge);
        }
        else if (this._user.isTurbo) {
            let turboBadge = document.createElement('i');
            turboBadge.classList.add('badge', 'turbo');
            badgesPart.appendChild(turboBadge);
        }

        if (this._user.cheerLevel) {
            let cheerBadge = document.createElement('i');
            cheerBadge.classList.add('badge', `cheer-${this._user.cheerLevel}`);
            badgesPart.appendChild(cheerBadge);
        }

        let userPart = lineFrag.querySelector('.username');
        userPart.classList.add('username');
        userPart.style.color = userColor;
        userPart.textContent = this._user.displayName;

        lineFrag.querySelector('.sep').textContent = this.isAction ? ' ' : ': ';

        let textPart = lineFrag.querySelector('.message');
        if (this.isAction) {
            textPart.style.color = userColor;
        }
        this.parseTextInto(textPart);

        return lineFrag;
    }

    parseTextInto(elem) {
        let text = this._text;
        this._textElem = elem;
        if (this._self) {
            this.parseTokenized(this._text);
        }
        else {
            let emotes = this._userState.emotes;
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
        let twitchEmotes = chatEmotes.getOwnTwitchEmotes();
        let bttvEmotes = chatEmotes.getBttvEmotes(this._channel);
        let cheerMatch = word.match(new RegExp(`^(${_cheerAlternation})(\\d+)$`, 'i'));
        if (this.isCheer && cheerMatch) {
            this.appendCurrentText();
            this.appendCheerEmote(cheerMatch[2], cheerMatch[1]);
        }
        else if (this._self && word in twitchEmotes) {
            this.appendCurrentText();
            this.appendEmote(twitchEmotes[word], word);
        }
        else if (word in bttvEmotes) {
            this.appendCurrentText();
            this.appendBttvEmote(bttvEmotes[word], word);
        }
        else {
            let match;
            while (match = word.match(_urlRegex)) {
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
                this._textElem.appendChild(link);
            }
            this._currentText += word;
        }
    }

    appendCurrentText() {
        if (this._currentText) {
            this._textElem.appendChild(document.createTextNode(this._currentText));
            this._currentText = '';
        }
    }

    appendEmote(emote, text) {
        let img = document.createElement('img');
        img.classList.add('emote');

        img.src = `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/1.0`;
        img.setAttribute('srcset', `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/2.0 2x`);
        img.setAttribute('alt', text);
        img.dataset.title = text;
        this._textElem.appendChild(img);
    }

    appendBttvEmote(emote, text) {
        let img = document.createElement('img');
        img.classList.add('emote', 'emote-bttv-' + emote.id);

        img.src = `https://cdn.betterttv.net/emote/${emote.id}/1x`;
        img.setAttribute('srcset', `https://cdn.betterttv.net/emote/${emote.id}/2x 2x`);
        img.setAttribute('alt', text);
        img.dataset.title = text;
        if ('width' in emote) {
            img.setAttribute('width', emote.width);
        }
        if ('height' in emote) {
            img.setAttribute('height', emote.height);
        }
        this._textElem.appendChild(img);
    }

    appendCheerEmote(count, type = null) {
        count = +count;
        let img = document.createElement('img');
        img.classList.add('emote');

        let highestEmote = Object.keys(_cheerEmotes).sort((a, b) => b - a).filter(a => a <= count)[0] || 1;
        let emoteData = _cheerEmotes[highestEmote];

        let imgBaseUrl;
        if (!type || type === 'cheer') {
            imgBaseUrl = `https://static-cdn.jtvnw.net/bits/dark/animated/${emoteData.image}`;
        }
        else {
            imgBaseUrl = `https://d3aqoihi2n8ty8.cloudfront.net/actions/${type}/dark/animated/${highestEmote}`;
        }

        img.src = `${imgBaseUrl}/1.gif`;
        img.setAttribute('srcset', `${imgBaseUrl}/2.gif 2x`);
        let name = `${type || 'cheer'}${count}`;
        img.setAttribute('alt', name);
        img.dataset.title = name;
        this._textElem.appendChild(img);

        let countElem = document.createElement('strong');
        countElem.textContent = count;
        countElem.style.color = emoteData.color;
        this._textElem.appendChild(countElem);
    }

    static _adjustColor(color) {
        color = new TinyColor(color);
        let bgColor = new TinyColor(window.getComputedStyle(document.getElementById('main')).backgroundColor);
        let bgIsDark = bgColor.getLuminance() <= 0.5;
        while (!TinyColor.isReadable(color, bgColor)) {
            if (bgIsDark) {
                color.brighten(1);
                if (TinyColor.equals(color, '#ffffff')) {
                    break;
                }
            }
            else {
                color.darken(1);
                if (TinyColor.equals(color, '#000000')) {
                    break;
                }
            }
        }

        return color.toHexString();
    }
}

module.exports = UIChatLine;