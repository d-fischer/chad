const settings = remote.require('./settings/settings');
const twitchAPIRequest = remote.require('./request/twitchAPI');
const channelManager = remote.require('./chat/channelManager');

const FunctionTools = require('./../src/tools/function');
const DomTools = require('./../src/tools/dom');

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
                let itemFrag = itemTpl.content.cloneNode(true);
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
        let currentChannels = (settings.get('connection:channels') || []).slice();
        let newChannel = this.dataset.name;
        if (currentChannels.indexOf(newChannel) === -1) {
            currentChannels.push(newChannel);
            this.classList.add('joined');
            settings.set('connection:channels', currentChannels);
            channelManager.add(newChannel);
            thisBrowserWindow.close();
        }
    });

    document.getElementById('close-button').addEventListener('click', () => thisBrowserWindow.close());
}