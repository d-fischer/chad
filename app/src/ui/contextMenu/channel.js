'use strict';

const BasicContextMenu = require('ui/contextMenu/basic');

const settings = remote.require('settings/settings');
const channelManager = remote.require('chat/channelManager');

class ChannelContextMenu extends BasicContextMenu {
    constructor(parentElem, channel) {
        super(parentElem);
        this._items = {
            leave: {
                label: 'Leave'
            }
        };
        this._channel = channel;
    }

    leave() {
        let removedChannel = this._channel.name;
        if (channelManager.has(removedChannel)) {
            let currentChannels = (settings.get('connection:channels') || []).slice();
            let index = currentChannels.indexOf(removedChannel);
            if (index !== -1) {
                currentChannels.splice(index, 1);
                settings.set('connection:channels', currentChannels);
            }
            channelManager.remove(removedChannel);
        }
    }
}

module.exports = ChannelContextMenu;