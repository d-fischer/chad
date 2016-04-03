'use strict';

const DomEvents = require('../dom/events');

let channels = {};

class ChatChannel {
    static get(name) {
        if (!(name in channels)) {
            channels[name] = new ChatChannel(name);
        }

        return channels[name];
    }

    constructor(name, noGui) {
        this._name = name;
        this._displayName = name;
        this._guiShown = false;
        this._isScrolledToBottom = true;
        this._listElement = undefined;
        this._element = undefined;
        noGui || this.showGui();
    }
    
    get name() {
        return this._name;
    }

    showGui() {
        if (!this._guiShown) {
            let channelList = document.getElementById('channel-list');
            let channelAdd = document.getElementById('channel-add');
            this._listElement = document.createElement('li');
            this._listElement.classList.add('menu-item', 'tab-link');
            this._listElement.dataset.tab = this._name;
            this._listElement.textContent = this._name;
            channelList.insertBefore(this._listElement, channelAdd);

            let channelWindows = document.getElementById('channel-windows');
            let channelWindowFrag = document.querySelector('#channel-window-template').content.cloneNode(true);
            this._element = channelWindowFrag.querySelector('.channel-window');
            this._element.dataset.name = this._name;
            this._element.addEventListener('tab:activate', () => {
                this.autoScroll();
            });
            
            DomEvents.delegate(this._element, 'load', 'img', () => {
                this.autoScroll();
            }, true);

            let messages = this._element.querySelector('.messages');
            messages.addEventListener('scroll', () => {
                this._isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
            });

            channelWindows.appendChild(channelWindowFrag);

            this._guiShown = true;
        }
    }

    destroy() {
        delete channels[this._name];
        if (this._guiShown) {
            this._listElement.remove();
            this._element.remove();
        }
    }

    autoScroll() {
        if (this._isScrolledToBottom) {
            let messages = this._element.querySelector('.messages');
            messages.scrollTop = messages.scrollHeight - messages.clientHeight;
        }
    }
}

module.exports = { get: ChatChannel.get.bind(ChatChannel.constructor) };