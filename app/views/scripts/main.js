'use strict';

const uiChannelManager = require('ui/channelManager');
const uiChatMessageHandler = require('ui/chat/handler/message');
const uiChatEventHandler = require('ui/chat/handler/event');

const UIEventHandler = require('ui/eventHandler');

const chatEmotes = remote.require('chat/emotes');
const channelManager = remote.require('chat/channelManager');
const chatConnection = remote.require('chat/connection');

const ChannelContextMenu = require('ui/contextMenu/channel');
const EmotesContextMenu = require('ui/contextMenu/emotes');
const SettingsContextMenu = require('ui/contextMenu/settings');
const settings = remote.require('settings/settings');

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
let channelAddHandler = channel => uiChannelManager.add(channel);
channelManager.on('channel-added', channelAddHandler);
chatEmotes.init();

window.updateAppearance = (initial = false) => {
    if (!initial) {
        for (let cls of document.body.classList) {
            if (cls.match(/^appearance-/)) {
                document.body.classList.remove(cls);
            }
        }
    }
    let appearanceSettings = settings.get('appearance');
    for (let setting of Reflect.ownKeys(appearanceSettings)) {
        if (appearanceSettings[setting] === true) {
            document.body.classList.add(`appearance-${setting}`);
        }
        else if (appearanceSettings[setting]) {
            document.body.classList.add(`appearance-${setting}-${appearanceSettings[setting]}`);
        }
    }
};

window.updateAppearance(true);

function windowLoaded(thisBrowserWindow) {
    window.closeWindow = () => {
        UIEventHandler.removeAll();
        uiChannelManager.removeAll();
        channelManager.removeListener('channel-added', channelAddHandler);
        thisBrowserWindow.close();
    };

    [].forEach.call(document.querySelectorAll(".system-button.min"),
        button => button.addEventListener("click", () => thisBrowserWindow.minimize()));

    [].forEach.call(document.querySelectorAll(".system-button.max"),
        button => button.addEventListener("click", () => thisBrowserWindow.maximize()));

    [].forEach.call(document.querySelectorAll(".system-button.close"),
        button => button.addEventListener("click", window.closeWindow));

    document.getElementById('channel-add').addEventListener('click', () => {
        remote.require('ui/window/manager').getWindow('channel').show('main');
    });

    window.toggleStreamerMode = () => {
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

    DomEvents.delegate(document.body, 'click', '.open-settings', function (e) {
        if (!this._contextMenu) {
            this._contextMenu = new SettingsContextMenu(this);
        }

        this._contextMenu.show(e);
    });

    DomEvents.delegate(document.body, 'contextmenu', '.channel-link', function (e) {
        if (!this._contextMenu) {
            this._contextMenu = new ChannelContextMenu(this, uiChannelManager.get(this.dataset.tab));
        }

        this._contextMenu.show(e);
    }, true);

    DomEvents.delegate(document.body, 'click', '.message-emote-button', function (e) {
        if (!this._contextMenu) {
            let channelName = this.closest('.channel-window').dataset.name;
            this._contextMenu = new EmotesContextMenu(this, uiChannelManager.get(channelName));
        }

        this._contextMenu.show(e);
    }, true);
}