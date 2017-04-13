'use strict';

const BasicContextMenu = require('ui/contextMenu/basic');

const ArrayTools = require('tools/array');

const settings = remote.require('settings/settings');
const channelManager = remote.require('chat/channelManager');

class ChannelContextMenu extends BasicContextMenu {
    /**
     * @param {HTMLElement} parentElem
     * @param {UIChannel} channel
     */
    constructor(parentElem, channel) {
        super(parentElem);
        this._items = {
            leave: {
                label: 'Leave'
            }
        };
        this._channel = channel;
    }

    //noinspection JSUnusedGlobalSymbols
    leave() {
        let removedChannel = this._channel.name;
        if (channelManager.has(removedChannel)) {
            let currentChannels = (settings.get('connection:channels') || []).slice();
            ArrayTools.removeItem(currentChannels, removedChannel);
            settings.set('connection:channels', currentChannels);
            this._channel.backend.leave();
        }
    }
}

module.exports = ChannelContextMenu;