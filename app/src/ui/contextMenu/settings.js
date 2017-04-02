'use strict';

const BasicContextMenu = require('ui/contextMenu/basic');

const settings = remote.require('settings/settings');
const channelManager = remote.require('chat/channelManager');

class SettingsContextMenu extends BasicContextMenu {
    constructor(parentElem) {
        super(parentElem);
        this._items = {
            settings: {
                label: 'Settings'
            },
            streamerMode: {
                type: 'toggle',
                icon: 'broadcast',
                label: 'Streamer mode'
            }
        };
    }

    settings() {
        remote.require('ui/window/manager').getWindow('settings').show('main', {
            selectedPanel: 'connection'
        });
    }

    //noinspection JSUnusedGlobalSymbols
    streamerMode__state() {
        return document.body.classList.contains('streamer-mode');
    }

    //noinspection JSUnusedGlobalSymbols
    streamerMode() {
        window.toggleStreamerMode();
    }
}

module.exports = SettingsContextMenu;