'use strict';

const ContextMenu = require('./contextMenu');
const DomTools = require('../../tools/dom');
const uiChannelManager = require('../channelManager');

const {remote} = require('electron');

const arrayContains = require('../../tools/array').contains;

class EmotesContextMenu extends ContextMenu {
    _buildDom() {
        let menuFrag = document.getElementById('emote-popover-template').content.cloneNode(true);
        let menu = menuFrag.firstElementChild;

        let emoteList = menuFrag.querySelector('.emote-list.twitch');

        let emotes = remote.require('./chat/emotes');
        let ownTwitchEmotes = emotes.getOwnTwitchEmotes();

        let twitchEmotesAdded = [];

        for (let ownEmote in ownTwitchEmotes) {
            if (ownTwitchEmotes.hasOwnProperty(ownEmote)) {
                let emote = ownTwitchEmotes[ownEmote];
                if (!arrayContains(twitchEmotesAdded, emote.id)) {
                    twitchEmotesAdded.push(emote.id);

                    let emoteItem = document.createElement('button');
                    emoteItem.classList.add('emote-button');
                    let img = document.createElement('img');
                    img.classList.add('emote-button-img');

                    img.src = `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/1.0`;
                    img.setAttribute('srcset', `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/2.0 2x`);
                    img.setAttribute('alt', ownEmote);
                    img.dataset.title = ownEmote;
                    emoteItem.appendChild(img);

                    emoteItem.onclick = () => this._addEmoteToText(ownEmote);

                    emoteList.appendChild(emoteItem);
                }
            }
        }

        return menu;
    }

    _place(mouseEvent) {
        let left = DomTools.getScrollLeftFrom(this._parentElem, document.body) + this._parentElem.offsetWidth
            - this._elem.offsetWidth;
        this._elem.style.left = `${left}px`;

        let top = DomTools.getScrollTopFrom(this._parentElem, document.body) - this._elem.offsetHeight - 2;
        this._elem.style.top = `${top}px`;
    }

    _addEmoteToText(emote) {
        let form = this._parentElem.closest('.message-form');
        let input = form.querySelector('.message-box');
        let val = input.value;
        let selStart = input.selectionStart;
        let selEnd = input.selectionEnd;
        let result = val.substr(0, selStart);
        if (selStart > 0 && val[selStart - 1] !== ' ') {
            result += ' ';
        }
        result += emote;
        if (val.length === selEnd || val[selEnd] !== ' ') {
            result += ' ';
        }
        let newCaretPos = result.length;
        result += val.substr(selEnd);
        input.value = result;
        input.selectionStart = newCaretPos;
        input.selectionEnd = newCaretPos;
    }
}

module.exports = EmotesContextMenu;