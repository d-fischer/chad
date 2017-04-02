'use strict';

const ContextMenu = require('ui/contextMenu/contextMenu');
const DomTools = require('tools/dom');

const {remote} = require('electron');

const arrayContains = require('tools/array').contains;

class EmotesContextMenu extends ContextMenu {
    constructor(parentElem, channel) {
        super(parentElem);
        this._channel = channel;
    }

    _buildDom() {
        let menuFrag = DomTools.getTemplateContent(document.getElementById('emote-popover-template'));
        let menu = menuFrag.firstElementChild;

        let emoteList = menuFrag.querySelector('.emote-list.twitch');

        let emotes = remote.require('chat/emotes');
        let ownTwitchEmotes = emotes.getOwnTwitchEmotes();
        let ownTwitchEmoteSetMap = emotes.getOwnTwitchEmoteSetMap();
        let ownTwitchEmoteSets = Reflect.ownKeys(ownTwitchEmoteSetMap);
        let channelName = this._channel.name;

        let getEmoteSetCategory = function (emoteSet) {
            let emoteSetName = emotes.getEmoteSetName(emoteSet);
            if (!emoteSetName) {
                return 0;
            }
            else if (emoteSetName === channelName) {
                return 3;
            }
            else if (emoteSetName === 'Turbo/Prime') {
                return 1;
            }
            else {
                return 2;
            }
        };

        ownTwitchEmoteSets.sort((a, b) => {
            let catA = getEmoteSetCategory(a);
            let catB = getEmoteSetCategory(b);
            return catA === catB ? (b - a) : (catB - catA);
        });

        let twitchEmotesAdded = [];

        for (let ownEmoteSet of ownTwitchEmoteSets) {
            let emoteGroup = document.createElement('div');
            emoteGroup.classList.add('emote-group');
            emoteGroup.dataset.emoteSet = ownEmoteSet;
            let emoteSetName = emotes.getEmoteSetName(ownEmoteSet);
            if (emoteSetName) {
                emoteGroup.dataset.name = emoteSetName;
            }

            for (let ownEmote of ownTwitchEmoteSetMap[ownEmoteSet]) {
                let emote = ownTwitchEmotes[ownEmote];
                if (!arrayContains(twitchEmotesAdded, emote.id)) {
                    twitchEmotesAdded.push(emote.id);

                    let emoteItem = document.createElement('button');
                    emoteItem.classList.add('emote-button');
                    emoteItem.dataset.title = ownEmote;

                    let img = document.createElement('img');
                    img.classList.add('emote-button-img');

                    img.src = `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/1.0`;
                    img.setAttribute('srcset', `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/2.0 2x`);
                    img.setAttribute('alt', ownEmote);
                    emoteItem.appendChild(img);

                    emoteItem.onclick = () => this._addEmoteToText(ownEmote);

                    emoteGroup.appendChild(emoteItem);
                }
            }

            emoteList.appendChild(emoteGroup);
        }

        let bttvChannelEmoteGroup = menuFrag.querySelector('.bttv-emotes-channel');
        let bttvChannelEmotes = emotes.getChannelBttvEmotes(channelName);
        if (!Reflect.ownKeys(bttvChannelEmotes).length) {
            bttvChannelEmoteGroup.parentNode.removeChild(bttvChannelEmoteGroup);
        }
        else {
            bttvChannelEmoteGroup.dataset.name = channelName;
            for (let bttvEmote in bttvChannelEmotes) {
                if (bttvChannelEmotes.hasOwnProperty(bttvEmote)) {
                    let emote = bttvChannelEmotes[bttvEmote];
                    let emoteItem = document.createElement('button');
                    emoteItem.classList.add('emote-button');
                    emoteItem.dataset.title = bttvEmote;

                    let img = document.createElement('img');
                    img.classList.add('emote-button-img');

                    img.src = `https://cdn.betterttv.net/emote/${emote.id}/1x`;
                    img.setAttribute('srcset', `https://cdn.betterttv.net/emote/${emote.id}/2x 2x`);
                    img.setAttribute('alt', bttvEmote);
                    if ('width' in emote) {
                        img.setAttribute('width', emote.width);
                    }
                    if ('height' in emote) {
                        img.setAttribute('height', emote.height);
                    }
                    emoteItem.appendChild(img);

                    emoteItem.onclick = () => this._addEmoteToText(bttvEmote);

                    bttvChannelEmoteGroup.appendChild(emoteItem);
                }
            }
        }

        let bttvGlobalEmoteGroup = menuFrag.querySelector('.bttv-emotes-global');
        let bttvGlobalEmotes = emotes.getGlobalBttvEmotes();
        if (!Reflect.ownKeys(bttvGlobalEmotes).length) {
            bttvGlobalEmoteGroup.parentNode.removeChild(bttvGlobalEmoteGroup);
        }
        else {
            for (let bttvEmote in bttvGlobalEmotes) {
                if (bttvGlobalEmotes.hasOwnProperty(bttvEmote)) {
                    let emote = bttvGlobalEmotes[bttvEmote];
                    let emoteItem = document.createElement('button');
                    emoteItem.classList.add('emote-button');
                    emoteItem.dataset.title = bttvEmote;

                    let img = document.createElement('img');
                    img.classList.add('emote-button-img');

                    img.src = `https://cdn.betterttv.net/emote/${emote.id}/1x`;
                    img.setAttribute('srcset', `https://cdn.betterttv.net/emote/${emote.id}/2x 2x`);
                    img.setAttribute('alt', bttvEmote);
                    if ('width' in emote) {
                        img.setAttribute('width', emote.width);
                    }
                    if ('height' in emote) {
                        img.setAttribute('height', emote.height);
                    }
                    emoteItem.appendChild(img);

                    emoteItem.onclick = () => this._addEmoteToText(bttvEmote);

                    bttvGlobalEmoteGroup.appendChild(emoteItem);
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

    show(mouseEvent) {
        super.show(mouseEvent);
        DomTools.fixSvgUses(this._elem);
    }
}

module.exports = EmotesContextMenu;