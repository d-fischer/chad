'use strict';

const UIEventHandler = require('./../../eventHandler');

const remote = require('electron').remote;
const chatEvents = remote.require('./chat/events');
const uiChannelManager = require('./../../channelManager');

class UIChatEventHandler extends UIEventHandler {
    constructor() {
        super(chatEvents);

        this.bindInitialEvents();
    }

    bindInitialEvents() {
        this.bindEventHandler('hosted', (channel, username, viewers) => {
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`${username} is hosting you with ${viewers} viewers!`);
        });
        this.bindEventHandler('hosting', (channel, target) => {
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`Now hosting ${target}.`);
        });
        this.bindEventHandler('notice', (channel, msgid, message) => {
            // TODO customize via msgid
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(message);
        });
        this.bindEventHandler('emoteonly', (channel, enabled) => {
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`Emote-only mode has been ${enabled ? 'enabled' : 'disabled'}.`);
        });
        this.bindEventHandler('r9kbeta', (channel, enabled) => {
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`r9k mode has been ${enabled ? 'enabled' : 'disabled'}.`);
        });
        this.bindEventHandler('slowmode', (channel, enabled, seconds) => {
            // TODO block sending messages too fast while in slow mode
            let channelName = channel.substring(1);
            let message;
            if (enabled) {
                message = `Slow mode has been enabled. You may send messages every ${seconds} seconds.`;
            }
            else {
                message = `Slow mode has been disabled.`;
            }
            uiChannelManager.get(channelName).displayEvent(message);
        });
        this.bindEventHandler('resub', (channel, username, months, message) => {
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`${username} has subscribed for ${months} months in a row!`);
        });
        this.bindEventHandler('subscribers', (channel, enabled) => {
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`Subscribers-only mode has been ${enabled ? 'enabled' : 'disabled'}.`);
        });
        this.bindEventHandler('subscription', (channel, username) => {
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`${username} just subscribed!`);
        });
        this.bindEventHandler('timeout', (channel, username) => {
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`${username} has been timed out.`);
        });
        this.bindEventHandler('unhost', (channel) => {
            // TODO save who is being hosted, output here
            let channelName = channel.substring(1);
            uiChannelManager.get(channelName).displayEvent(`No longer hosting someone else.`);
        });
    }
}

module.exports = new UIChatEventHandler;