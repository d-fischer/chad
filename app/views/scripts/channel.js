const settings = remote.require('settings/settings');
const twitchAPIRequest = remote.require('request/twitchAPI').request;
const channelManager = remote.require('chat/channelManager');

const FunctionTools = require('tools/function');

const list = document.getElementById('channel-add-list');
const itemTpl = document.getElementById('channel-list-item-template');

let seq = 0;

document.querySelector('#channel-add-search').addEventListener('keyup', FunctionTools.debounce(e => {
    let mySeq = ++seq;
    DomTools.clearChildren(document.getElementById('channel-add-list'));
    if (!e.target.value) {
        return;
    }
    let currentChannels = settings.get('connection:channels') || [];
    const url = 'https://api.twitch.tv/kraken/search/channels?limit=25&q=' + encodeURIComponent(e.target.value);
    twitchAPIRequest(url, (data, success) => {
        // have we already sent another request after this one? then ignore this one
        if (success && mySeq === seq) {
            for (let channel of data.channels) {
                let itemFrag = DomTools.getTemplateContent(itemTpl);
                let item = itemFrag.querySelector('.channel-list-item');
                item.dataset.name = channel.name;
                if (currentChannels.indexOf(channel.name) !== -1) {
                    item.classList.add('joined');
                }
                if (channel.logo) {
                    item.querySelector('.user-picture').style.backgroundImage = `url(${channel.logo})`;
                }
                item.querySelector('.user-name').textContent = channel.display_name;
                item.querySelector('.user-game').textContent = channel.game;
                item.querySelector('.user-status').textContent = channel.status;
                list.appendChild(item);
            }
        }
    });
}));

function windowLoaded(thisBrowserWindow) {
    DomEvents.delegate(list, 'click', '.channel-list-item', function() {
        let newChannel = this.dataset.name;
        let alreadyJoined = channelManager.has(newChannel);
        let currentChannels = (settings.get('connection:channels') || []).slice();
        if (currentChannels.indexOf(newChannel) === -1) {
            currentChannels.push(newChannel);
            settings.set('connection:channels', currentChannels);
            this.classList.add('joined');
            if (!alreadyJoined) {
                channelManager.add(newChannel);
            }
            thisBrowserWindow.close();
        }
    });

    document.getElementById('close-button').addEventListener('click', () => thisBrowserWindow.close());

    document.getElementById('channel-add-search').focus();
}