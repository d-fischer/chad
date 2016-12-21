'use strict';

const tmi = require('tmi.js');
const settings = require('../settings/settings');
const chatEvents = require('./events');

const ChatConnectionError = require('../error/chat-connection');
const SettingsMissingError = require('../error/settings-missing');

class ChatConnection {
    constructor() {
        this._chatInterface = undefined;
        this._config = settings.get('connection') || {};
        this._userName = undefined;
    }

    connect() {
        let connectFn = (resolve, reject) => {
            this._config = settings.get('connection') || {};
            if (this._config && this._config.username && this._config.token) {
                this._userName = this._config.username;
                if (this._chatInterface) {
                    throw new Error('can\'t connect twice at the same time');
                }
                this._chatInterface = new tmi.client({
                    debug: true,
                    connection: {
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
                    this._chatInterface.on(eventName, function (...args) {
                        chatEvents.emit(eventName, ...args);
                    });
                }
                this._chatInterface.connect().then(resolve, err => {
                    reject(new ChatConnectionError(err));
                });
            }
            else {
                reject(new SettingsMissingError);
            }
        };
        if (this.isConnected) {
            return this._chatInterface.disconnect().then(() => {
                this._chatInterface = undefined;
                return new Promise(connectFn);
            });
        }
        else {
            return new Promise(connectFn);
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

    get userName() {
        return this._userName;
    }
}

module.exports = new ChatConnection;