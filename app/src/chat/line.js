'use strict';

let ChatUser = require('./user');
let ChatMessage = require('./message');

class ChatLine {
    constructor(channel, userData, message, self, time) {
        this._channel = channel;
        this._userData = userData;
        this._self = self;
        this._user = new ChatUser(userData);
        this._message = new ChatMessage(message, userData.emotes);
        this._time = time || new Date();
    }

    get user() {
        return this._user;
    }

    get message() {
        return this._message;
    }

    parseInto(elem, isAction) {
        let timePart = document.createElement('time');
        timePart.setAttribute('datetime', this._time.toISOString());
        timePart.appendChild(document.createTextNode(this._time.toLocaleTimeString()));
        elem.appendChild(timePart);

        let badgesPart = document.createElement('span');
        badgesPart.classList.add('badges');

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

        if (this._user.isTurbo) {
            let modBadge = document.createElement('i');
            modBadge.classList.add('badge', 'turbo');
            badgesPart.appendChild(modBadge);
        }

        if (this._user.isSub) {
            let subBadge = document.createElement('i');
            subBadge.classList.add('badge', 'sub');
            badgesPart.appendChild(subBadge);
        }

        elem.appendChild(badgesPart);

        let userPart = document.createElement('span');
        userPart.classList.add('username');
        userPart.style.color = this._user.color;
        userPart.textContent = this._user.displayName;
        elem.appendChild(userPart);

        elem.appendChild(document.createTextNode(isAction ? ' ' : ': '));

        let textPart = document.createElement('span');
        textPart.classList.add('message');
        if (isAction) {
            textPart.style.color = this._user.color;
        }
        this._message.parseInto(textPart);
        elem.appendChild(textPart);
    }
}

module.exports = ChatLine;