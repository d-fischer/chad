'use strict';

const request = require('request');

const remote = require('electron').remote;

const twitchAPIRequest = remote.require('request/twitchAPI').request;

const DomEvents = require('dom/events');
const DomTools = require('tools/dom');

class UIChannel {
    constructor(name) {
        this._name = name;
        this._guiShown = false;
        let backend = this.backend;
        let updateGuiCb = this.updateGuiWithChannelData.bind(this);
        let onlineCb = this.notifyOnline.bind(this);
        let destroyCb = this.destroy.bind(this);
        backend.on('updated', updateGuiCb);
        backend.on('online', onlineCb);
        backend.on('leaving', destroyCb);
        this.destroyEvents = () => {
            let backend = this.backend;
            backend.off('updated', updateGuiCb);
            backend.off('online', onlineCb);
            backend.off('leaving', destroyCb);
        };
        this._listElement = undefined;
        this._element = undefined;
        this._badgeStyle = document.createElement('style');
        this._isScrolledToBottom = true;
        this.showGui();
        this.updateBadges();
    }

    get backend() {
        return channelManager.get(this._name);
    }

    get name() {
        return this._name;
    }

    updateBadges() {
        let backend = this.backend;
        if (!backend._channelData) {
            setTimeout(this.updateBadges.bind(this), 500);
            return;
        }
        // twitchAPIRequest(`https://api.twitch.tv/kraken/chat/${this._name}/badges`, (data, success) => {
        twitchAPIRequest(`https://badges.twitch.tv/v1/badges/channels/${backend._channelData._id}/display`, (data, success) => {
            if (success) {
                if (data && data.badge_sets && data.badge_sets.subscriber && data.badge_sets.subscriber.versions) {
                    let style = '';
                    let badges = data.badge_sets.subscriber.versions;
                    for (let badgeVersion in badges) {
                        if (badges.hasOwnProperty(badgeVersion)) {
                            style += `
                                .channel-window[data-name=${this._name}] .badges .sub-${badgeVersion} {
                                    background-image: url(${badges[badgeVersion].image_url_1x});
                                }
                                
                                @media (min-resolution: 1.5dppx) {
                                    .channel-window[data-name=${this._name}] .badges .sub-${badgeVersion} {
                                        background-image: url(${badges[badgeVersion].image_url_2x});
                                    }
                                }
                                
                                @media (min-resolution: 2.5dppx) {
                                    .channel-window[data-name=${this._name}] .badges .sub-${badgeVersion} {
                                        background-image: url(${badges[badgeVersion].image_url_4x});
                                    }
                                }
                            `;
                        }
                    }

                    this._badgeStyle.textContent = style;
                }
            }
        });
    }

    showGui() {
        if (!this._guiShown) {
            let channelList = document.getElementById('channel-list');
            let channelAdd = document.getElementById('channel-add');
            this._listElement = document.createElement('li');
            this._listElement.classList.add('menu-item', 'tab-link', 'channel-link');
            this._listElement.dataset.tab = this._name;

            let channelIconWrap = document.createElement('div');
            channelIconWrap.classList.add('logo-wrap');

            let channelIcon = document.createElement('img');
            channelIcon.classList.add('logo', 'menu-icon');
            channelIconWrap.appendChild(channelIcon);

            this._listElement.appendChild(channelIconWrap);

            let channelName = document.createElement('span');
            channelName.classList.add('name', 'menu-title');
            this._listElement.appendChild(channelName);

            channelList.insertBefore(this._listElement, channelAdd);

            let channelWindows = document.getElementById('channel-windows');
            let channelWindowFrag = DomTools.getTemplateContent(document.querySelector('#channel-window-template'));
            this._element = channelWindowFrag.querySelector('.channel-window');
            this._element.insertBefore(this._badgeStyle, this._element.firstChild);
            this._element.dataset.name = this._name;
            this._element.addEventListener('tab:activate', () => {
                this.autoScroll();
                this.markRead();
            });

            DomEvents.delegate(this._element, 'load', 'img', () => {
                this.autoScroll();
            }, true);

            let messages = this._element.querySelector('.messages');
            messages.addEventListener('scroll', () => {
                this._isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
            });

            channelWindows.appendChild(channelWindowFrag);
            DomTools.fixSvgUses(this._element);

            this.updateGuiWithChannelData();

            this._guiShown = true;
        }
    }

    destroy() {
        this.destroyEvents();

        if (this._guiShown) {
            this._listElement.remove();
            this._listElement = undefined;
            this._element.remove();
            this._element = undefined;
        }
    }

    autoScroll() {
        if (this._isScrolledToBottom) {
            let messages = this._element.querySelector('.messages');
            messages.scrollTop = messages.scrollHeight - messages.clientHeight;
        }
    }

    markNewMessage() {
        if (!this._listElement.classList.contains('active')) {
            this._listElement.classList.add('new-message');
        }
    }

    markRead() {
        this._listElement.classList.remove('new-message');
    }

    displayEvent(message) {
        let linesList = this._element.querySelector('.messages');
        let lineContainer = document.createElement('li');
        lineContainer.classList.add('event');

        let timePart = document.createElement('time');
        let time = new Date();
        timePart.setAttribute('datetime', time.toISOString());
        timePart.appendChild(document.createTextNode(time.toLocaleTimeString()));
        lineContainer.appendChild(timePart);

        let textPart = document.createElement('span');
        textPart.classList.add('message');
        textPart.textContent = message;
        lineContainer.appendChild(textPart);

        linesList.appendChild(lineContainer);

        [].forEach.call(linesList.querySelectorAll('li:nth-last-child(n+1001)'), line => linesList.removeChild(line));

        this.autoScroll();
    }

    updateGuiWithChannelData() {
        let backend = this.backend;
        this._listElement.querySelector('.logo').src = backend._channelLogo;
        this._listElement.querySelector('.name').textContent = backend._displayName;
        if (backend._online) {
            this._listElement.classList.add('online');
            this._element.classList.add('online');
        }
        else {
            this._listElement.classList.remove('online');
            this._element.classList.remove('online');
        }
        this._element.querySelector('.channel-info .name').textContent = backend._displayName;
        this._element.querySelector('.channel-info .game').textContent = backend._gameName || '';
        this._element.querySelector('.channel-info .status').textContent = backend._statusText;
    }

    notifyOnline() {
        let backend = this.backend;
        let ntf = new Notification(`${backend._displayName} is now online`, {
            body: backend._statusText,
            icon: backend._channelLogo,
            silent: true
        });
    }
}

module.exports = UIChannel;