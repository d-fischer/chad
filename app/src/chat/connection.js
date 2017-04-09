'use strict';

/** @constructs {TwitchClient} */
const TwitchClient = require('tmi.js').client;
const settings = require('settings/settings');
const chatEvents = require('chat/events');

const ChatConnectionError = require('error/chat-connection');
const SettingsMissingError = require('error/settings-missing');

class ChatConnection {
    constructor() {
        /**
         * @type {?TwitchClient}
         * @private
         */
        this._chatInterface = null;

        /**
         * @type {Object} this._config
         * @property {string} username
         * @property {string} token
         * @property {string[]} channels
         * @private
         */
        this._config = settings.get('connection') || {};
    }

    connect() {
        let connectFn = (resolve, reject) => {
            this._config = settings.get('connection') || {};
            if (this._config && this._config.username && this._config.token) {
                if (this._chatInterface) {
                    throw new Error('can\'t connect twice at the same time');
                }
                this._chatInterface = new TwitchClient({
                    debug: true,
                    connection: {
                        reconnect: true
                    },
                    identity: {
                        username: this._config.username,
                        password: 'oauth:' + this._config.token
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
        if (this._chatInterface) {
            let oldInterface = this._chatInterface;
            let isConnected = this.isConnected;
            this._chatInterface = null;
            if (isConnected) {
                return oldInterface.disconnect().then(() => {
                    return new Promise(connectFn);
                });
            }
        }
        return new Promise(connectFn);
    }

    get isConnected() {
        return this._chatInterface && this._chatInterface.readyState() === 'OPEN';
    }

    get isConnecting() {
        return this._chatInterface && this._chatInterface.readyState() === 'CONNECTING';
    }

    /**
     *
     * @returns {?TwitchClient}
     */
    get chatInterface() {
        return this._chatInterface;
    }

    get userName() {
        return this._config.username;
    }
}

module.exports = new ChatConnection;