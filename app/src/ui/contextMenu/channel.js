'use strict';

const ContextMenu = require('./contextMenu');

const settings = remote.require('./settings/settings');
const channelManager = remote.require('./chat/channelManager');

class ChannelContextMenu extends ContextMenu {
    constructor(channel) {
        super();
        this._items = {
            leave: {
                label: 'Leave'
            }
        };
        this._channel = channel;
    }

    leave() {
        let currentChannels = (settings.get('connection:channels') || []).slice();
        let removedChannel = this._channel.name;
        let index = currentChannels.indexOf(removedChannel);
        if (index !== -1) {
            currentChannels.splice(index, 1);
            settings.set('connection:channels', currentChannels);
            channelManager.remove(removedChannel);
        }
    }
}

module.exports = ChannelContextMenu;