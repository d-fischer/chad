'use strict';

const uiChannelManager = require('./../src/ui/channelManager');
const uiChatMessageHandler = require('./../src/ui/chat/handler/message');
const uiChatEventHandler = require('./../src/ui/chat/handler/event');

const UIChatEmotes = require('./../src/ui/chat/emotes');

const channelManager = remote.require('./chat/channelManager');

DomEvents.delegate(document.getElementById('channel-windows'), 'submit', '.message-form', function (e) {
    e.preventDefault();
    let channelWindow = this.closest('.channel-window');
    let box = this.querySelector('.message-box');
    let message = box.value;
    box.value = '';
    let channel = channelManager.get(channelWindow.dataset.name);
    channel.say(message);
});

uiChannelManager.addAll(channelManager.getAllNames());
channelManager.on('channel-added', channel => uiChannelManager.add(channel));
UIChatEmotes.init();

function windowLoaded(thisBrowserWindow) {
    [].forEach.call(document.querySelectorAll(".system-button.min"),
        button => button.addEventListener("click", () => thisBrowserWindow.minimize()));

    [].forEach.call(document.querySelectorAll(".system-button.max"),
        button => button.addEventListener("click", () => thisBrowserWindow.maximize()));

    [].forEach.call(document.querySelectorAll(".system-button.close"),
        button => button.addEventListener("click", () => thisBrowserWindow.close()));

    document.getElementById('channel-add').addEventListener('click', () => {
        remote.require('./ui/window/manager').getWindow('channel').show('main');
    });

    thisBrowserWindow.on('close', () => {
        uiChatEventHandler.removeEventHandlers();
        uiChatMessageHandler.removeEventHandlers();
    });
}