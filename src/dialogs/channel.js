'use strict';

const Dialog = require('../dialog');

const settings = require('../settings');
const FunctionTools = require('../tools/function');
const DomTools = require('../tools/dom');
const JSONPRequest = require('../request/jsonp');
const DomEvents = require('../dom/events');

class ChannelDialog extends Dialog {
    constructor() {
        super('channel-add-dialog');
        if (!ChannelDialog.initialized) {
            this.initialize();
            ChannelDialog.initialized = true;
        }
        this._request = undefined;
    }

    initialize() {
        const list = document.getElementById('channel-add-list');
        const itemTpl = document.getElementById('channel-list-item-template');
        this._element.querySelector('#channel-add-search').addEventListener('keyup', FunctionTools.debounce(e => {
            if (this._request) {
                this._request.abort();
                this._request = undefined;
            }
            DomTools.clearChildren(document.getElementById('channel-add-list'));
            if (!e.target.value) {
                return;
            }
            let currentChannels = settings.get('connection.channels') || [];
            const url = 'https://api.twitch.tv/kraken/search/channels?limit=25&q=' + encodeURIComponent(e.target.value);
            this._request = new JSONPRequest(url, (data, success) => {
                if (success) {
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
            this._request.call();
        }));

        DomEvents.delegate(list, 'click', '.channel-list-item', function() {
            let currentChannels = (settings.get('connection.channels') || []).slice();
            let newChannel = this.dataset.name;
            if (currentChannels.indexOf(newChannel) === -1) {
                currentChannels.push(newChannel);
                this.classList.add('joined');
                settings.set('connection.channels', currentChannels);
            }
        });
    }

    show() {
        document.getElementById('channel-add-search').value = '';
        super.show();
    }
}

module.exports = ChannelDialog;