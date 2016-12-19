'use strict';

const uiChannelManager = require('../src/ui/channelManager');
const uiChatMessageHandler = require('../src/ui/chat/handler/message');
const uiChatEventHandler = require('../src/ui/chat/handler/event');

const UIEventHandler = require('../src/ui/eventHandler');

const chatEmotes = remote.require('./chat/emotes');
const channelManager = remote.require('./chat/channelManager');
const chatConnection = remote.require('./chat/connection');

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
chatEmotes.init();

function windowLoaded(thisBrowserWindow) {
    window.closeWindow = () => {
        UIEventHandler.removeAll();
        uiChannelManager.removeAll();
        thisBrowserWindow.close()
    };

    [].forEach.call(document.querySelectorAll(".system-button.min"),
        button => button.addEventListener("click", () => thisBrowserWindow.minimize()));

    [].forEach.call(document.querySelectorAll(".system-button.max"),
        button => button.addEventListener("click", () => thisBrowserWindow.maximize()));

    [].forEach.call(document.querySelectorAll(".system-button.close"),
        button => button.addEventListener("click", window.closeWindow));

    document.getElementById('channel-add').addEventListener('click', () => {
        remote.require('./ui/window/manager').getWindow('channel').show('main');
    });

    let toggleStreamerMode = () => {
        let me = chatConnection.userName;
        if (!channelManager.get(me)) {
            uiChannelManager.on('channel-added', function addedCallback(channel) {
                if (channel === me) {
                    uiChannelManager.removeListener('channel-added', addedCallback);
                    toggleStreamerMode();
                }
            });
            channelManager.add(me);
        }
        else if (document.body.classList.contains('streamer-mode')) {
            document.body.classList.remove('streamer-mode');
        }
        else {
            activateTab(document.getElementById('main-window'), me);
            document.body.classList.add('streamer-mode');
        }
    };

    DomEvents.delegate(document.body, 'click', '.streamer-mode-toggle', toggleStreamerMode);
}