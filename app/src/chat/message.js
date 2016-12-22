'use strict';

/** @var RegExp */
const urlRegex = /(https?:\/\/)?(?:www\.)?(?:(?:[-a-z0-9@:%_\+~#=])+\.)+[a-z]{2,6}\b[-a-z0-9@:%_+.~#?&/=]*/i;

class ChatMessage {
    constructor(text, channel, self, tagEmotes) {
        this._text = text;
        this._channel = channel;
        this._self = self;
        this._tagEmotes = tagEmotes;
        this._currentText = '';
        this._textElem = undefined;
    }
}

module.exports = ChatMessage;