'use strict';

const DomEvents = require('../dom/events');
const JSONPRequest = require('../request/jsonp');
const ChatLine = require('./line');

const chatEvents = require('./events');

const request = require('request');

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
        this._channelData = undefined;
        this._streamData = undefined;
        this._badgeData = undefined;
        this._bttvEmotes = {};
        this._channelLogo = 'img/default-user.svg';
        this._badgeStyle = document.createElement('style');
        this._gameName = '';
        this._statusText = '';
        this._online = undefined;
        this._updateTimer = undefined;
        this._updateInterval = 10;
        this.initData();
        noGui || this.showGui();
    }

    get element() {
        return this._element;
    }

    initData() {
        this.updateData();
        this.startAutoUpdate();
        this.updateBadges();
        this.updateBttvData();
    }

    startAutoUpdate() {
        if (this._updateTimer) {
            clearInterval(this._updateTimer);
        }
        this._updateTimer = setInterval(() => this.updateData(), this._updateInterval * 60 * 1000);
    }

    updateData() {
        (new JSONPRequest(`https://api.twitch.tv/kraken/channels/${this._name}`, (data, success) => {
            if (success) {
                this._channelData = data;
                this._channelLogo = data.logo || this._channelLogo;
                this._displayName = data.display_name;
                this._gameName = data.game || '';
                this._statusText = data.status || '';
                this.updateGuiWithChannelData();
            }
        })).call();

        (new JSONPRequest(`https://api.twitch.tv/kraken/streams/${this._name}`, (data, success) => {
            if (success) {
                this._streamData = data.stream;
                let oldOnline = this._online;

                if (data.stream === null) {
                    this._online = false;
                }
                else {
                    this._online = true;
                }

                if (oldOnline === false && this._online) {
                    let ntf = new Notification(`${data.stream.channel.display_name} is now online`, {
                        body: data.stream.channel.status,
                        icon: data.stream.channel.logo,
                        silent: true
                    });
                }

                this.updateGuiWithChannelData();
            }
        })).call();
    }

    updateBadges() {
        (new JSONPRequest(`https://api.twitch.tv/kraken/chat/${this._name}/badges`, (data, success) => {
            if (success) {
                this._badgeData = data;
                if (data.subscriber) {
                    this._badgeStyle.textContent = `
                        .channel-window[data-name=${this._name}] .badges .sub {
                            background-image: url(${data.subscriber.image});
                        }
                    `;
                }
            }
        })).call();
    }

    updateBttvData() {
        request(`https://api.betterttv.net/2/channels/${this._name}`, (err, res, data) => {
            if (!err && res.statusCode === 200) {
                data = JSON.parse(data);
                let urlTemplate = data.urlTemplate;
                this._bttvEmotes = {};
                for (let emote of data.emotes) {
                    this._bttvEmotes[emote.code] = {
                        url: urlTemplate.replace('{{id}}', emote.id).replace('{{image}}', '1x')
                    }
                }
            }
        });
    }

    get name() {
        return this._name;
    }

    get bttvEmotes() {
        return this._bttvEmotes;
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
            channelIconWrap.appendChild(channelIcon)

            this._listElement.appendChild(channelIconWrap);

            let channelName = document.createElement('span');
            channelName.classList.add('name', 'menu-title');
            this._listElement.appendChild(channelName);

            channelList.insertBefore(this._listElement, channelAdd);

            let channelWindows = document.getElementById('channel-windows');
            let channelWindowFrag = document.querySelector('#channel-window-template').content.cloneNode(true);
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

            this.updateGuiWithChannelData();

            this._guiShown = true;
        }
    }

    destroy() {
        delete channels[this._name];
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

        this.autoScroll();
    }

    updateGuiWithChannelData() {
        this._listElement.querySelector('.logo').src = this._channelLogo;
        this._listElement.querySelector('.name').textContent = this._displayName;
        if (this._online) {
            this._listElement.classList.add('online');
            this._element.classList.add('online');
        }
        else {
            this._listElement.classList.remove('online');
            this._element.classList.remove('online');
        }
        this._element.querySelector('.channel-info .name').textContent = this._displayName;
        this._element.querySelector('.channel-info .game').textContent = this._gameName || '';
        this._element.querySelector('.channel-info .status').textContent = this._statusText;
    }
}

chatEvents.on('chat', (channelName, userData, message, self) => {
    channelName = channelName.substring(1);
    let channel = ChatChannel.get(channelName);
    let linesList = channel.element.querySelector('.messages');
    let line = new ChatLine(message, channel, userData, self);
    let lineContainer = document.createElement('li');

    line.parseInto(lineContainer, false);
    linesList.appendChild(lineContainer);
    channel.autoScroll();
    channel.markNewMessage();
}).on('action', (channelName, userData, message, self) => {
    channelName = channelName.substring(1);
    let channel = ChatChannel.get(channelName);
    let linesList = channel.element.querySelector('.messages');
    let line = new ChatLine(message, channel, userData, self);
    let lineContainer = document.createElement('li');

    line.parseInto(lineContainer, true);
    linesList.appendChild(lineContainer);
    channel.autoScroll();
    channel.markNewMessage();
}).on('hosted', (channel, username, viewers) => {
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(`${username} is hosting you with ${viewers} viewers!`);
}).on('hosting', (channel, target) => {
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(`Now hosting ${target}.`);
}).on('notice', (channel, msgid, message) => {
    // TODO customize via msgid
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(message);
}).on('r9kbeta', (channel, enabled) => {
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(`r9k mode has been ${enabled ? 'enabled' : 'disabled'}.`);
}).on('slowmode', (channel, enabled, seconds) => {
    // TODO block sending messages too fast while in slow mode
    let channelName = channel.substring(1);
    let message;
    if (enabled) {
        message = `Slow mode has been enabled. You may send messages every ${seconds} seconds.`;
    }
    else {
        message = `Slow mode has been disabled.`;
    }
    ChatChannel.get(channelName).displayEvent(message);
}).on('subanniversary', (channel, username, months) => {
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(`${username} has subscribed for ${months} months in a row!`);
}).on('subscribers', (channel, enabled) => {
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(`Subscribers-only mode has been ${enabled ? 'enabled' : 'disabled'}.`);
}).on('subscription', (channel, username) => {
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(`${username} just subscribed!`);
}).on('timeout', (channel, username) => {
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(`${username} has been timed out.`);
}).on('unhost', (channel) => {
    // TODO save who is being hosted, output here
    let channelName = channel.substring(1);
    ChatChannel.get(channelName).displayEvent(`No longer hosting someone else.`);
});

module.exports = {get: ChatChannel.get.bind(ChatChannel.constructor)};