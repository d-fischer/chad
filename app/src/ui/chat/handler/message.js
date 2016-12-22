'use strict';

const UIChatLine = require('./../line');
const UIEventHandler = require('./../../eventHandler');
const uiChannelManager = require('./../../channelManager');

const remote = require('electron').remote;
const chatEvents = remote.require('./chat/events');

class UIChatMessageHandler extends UIEventHandler {
    constructor() {
        super(chatEvents);

        this.bindInitialEvents();
    }

    bindInitialEvents() {
        this.bindEventHandler('chat', this.handleMessage.bind(this));
        this.bindEventHandler('action', this.handleMessage.bind(this));
        this.bindEventHandler('resubmsg', this.handleMessage.bind(this));
        this.bindEventHandler('cheer', this.handleMessage.bind(this));
    }

    handleMessage(channelName, userData, message, self) {
        channelName = channelName.substring(1);
        let channel = uiChannelManager.get(channelName);
        let linesList = channel._element.querySelector('.messages');
        let line = new UIChatLine(message, channel.name, userData, self);
        let lineContainer = line.parse(false);
        linesList.appendChild(lineContainer);
        [].forEach.call(linesList.querySelectorAll('li:nth-last-child(n+1001)'), line => linesList.removeChild(line));
        channel.autoScroll();
        channel.markNewMessage();
    }
}

module.exports = new UIChatMessageHandler;