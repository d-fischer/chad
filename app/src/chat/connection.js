'use strict';

const tmi = require('tmi.js');
const settings = require('../settings');
const chatEvents = require('./events');

const ChatConnectionError = require('../error/chat-connection');
const SettingsMissingError = require('../error/settings-missing');

class ChatConnection {
    constructor() {
        this._chatInterface = undefined;
        this._config = settings.getSync('connection') || {};
        this._emoteSets = {};
        this._connectStatus = undefined;
    }

    connect() {
        let connectPromise = new Promise((resolve, reject) => {
            this._config = settings.getSync('connection') || {};
            if (this._config && this._config.username && this._config.token) {
                if (this._chatInterface) {
                    this._chatInterface.disconnect();
                    this._connectStatus = undefined;
                }
                let _client = this._chatInterface = new tmi.client({
                    debug: true,
                    connection: {
                        // cluster: 'aws',
                        reconnect: true
                    },
                    identity: {
                        username: this._config.username,
                        password: this._config.token
                    }
                });
                // forward events
                for (let eventName of [
                    'action', 'chat', 'cheer', 'emotesets', 'emoteonly', 'hosted', 'hosting', 'logon', 'notice',
                    'r9kbeta', 'slowmode', 'resub', 'resubmsg', 'subscribers', 'subscription',
                    'timeout', 'unhost', 'whisper',
                    'connecting', 'connected', 'disconnected'
                ]) {
                    _client.on(eventName, chatEvents.emit.bind(chatEvents, eventName));
                }
                _client.on('emotesets', sets => this._emoteSets = sets);
                _client.connect().then(resolve, err => {
                    reject(new ChatConnectionError(err));
                });
            }
            else {
                reject(new SettingsMissingError);
            }
        });
        if (this.isConnected) {
            return this._chatInterface.disconnect().then(connectPromise);
        }
        else {
            return connectPromise;
        }
    }

    get isConnected() {
        return this._chatInterface && this._chatInterface.readyState() === 'OPEN';
    }

    get isConnecting() {
        return this._chatInterface && this._chatInterface.readyState() === 'CONNECTING';
    }

    get chatInterface() {
        return this._chatInterface;
    }

    get emoteSets() {
        return this._emoteSets;
    }
}

module.exports = new ChatConnection;