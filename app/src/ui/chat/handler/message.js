'use strict';

const UIChatLine = require('ui/chat/line');
const UIEventHandler = require('ui/eventHandler');
const uiChannelManager = require('ui/channelManager');
const pluginEvents = require('plugin/events');

const remote = require('electron').remote;
const chatEvents = remote.require('chat/events');

class UIChatMessageHandler extends UIEventHandler {
    constructor() {
        super(chatEvents);

        this.bindInitialEvents();
    }

    bindInitialEvents() {
        this.bindEventHandler('chat', this.handleMessage.bind(this, 'chat'));
        this.bindEventHandler('action', this.handleMessage.bind(this, 'action'));
        this.bindEventHandler('resubmsg', this.handleMessage.bind(this, 'resubmsg'));
        this.bindEventHandler('cheer', this.handleMessage.bind(this, 'cheer'));
    }

    handleMessage(type, channelName, userData, message, self) {
        channelName = channelName.substring(1);
        let channel = uiChannelManager.get(channelName);
        let linesList = channel._element.querySelector('.messages');
        let line = new UIChatLine(message, channel.name, userData, self);
        let lineContainer = line.parse(false);
        pluginEvents.handle(type, channelName, message, userData, lineContainer);
        linesList.appendChild(lineContainer);
        [].forEach.call(linesList.querySelectorAll('li:nth-last-child(n+1001)'), line => linesList.removeChild(line));
        channel.autoScroll();
        channel.markNewMessage();
    }
}

module.exports = new UIChatMessageHandler;