/**
 * @external DomEvents
 * @constructs DomEvents
 */

/**
 * @external DomTools
 * @constructs DomTools
 */

const settings = remote.require('settings/settings');
const twitchAPIRequest = remote.require('api/twitchAPI').request;
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
    const url = 'https://api.twitch.tv/kraken/search/channels?limit=25&query=' + encodeURIComponent(e.target.value);
    twitchAPIRequest(url).then(data => {
        // have we already sent another request after this one? then ignore this one
        if (mySeq === seq) {
            /**
             * @type object
             * @property {String} logo
             * @property {String} display_name
             * @property {String} game
             * @property {String} status
             */
            for (let channel of data.channels) {
                let itemFrag = DomTools.getTemplateContent(itemTpl);
                let item = itemFrag.querySelector('.channel-list-item');
                item.dataset.name = channel.name;
                if (currentChannels.includes(channel.name)) {
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

const thisBrowserWindow = remote.getCurrentWindow();

DomEvents.delegate(list, 'click', '.channel-list-item', function() {
    let channelName = this.dataset.name;
    let channel = channelManager.get(channelName);
    let currentChannels = (settings.get('connection:channels') || []).slice();
    if (!currentChannels.includes(channelName)) {
        currentChannels.push(channelName);
        settings.set('connection:channels', currentChannels);
        this.classList.add('joined');
        channel.isJoined || channel.join();
        thisBrowserWindow.close();
    }
});

document.getElementById('close-button').addEventListener('click', () => thisBrowserWindow.close());

document.getElementById('channel-add-search').focus();