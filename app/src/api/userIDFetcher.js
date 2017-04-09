"use strict";

const twitchAPI = require('api/twitchAPI');
const FunctionTools = require('tools/function');

const TWITCH_API_MAX_USERNAMES = 100;

class UserIDFetcher {
    constructor() {
        /**
         * @type {Object.<string, number>}
         * @private
         */
        this._cache = {};

        /**
         * @type {Object.<string, {resolve: Function, reject: Function}[]>}
         * @private
         */
        this._queue = {};
    }

    get(userName, resolve, reject) {
        if (this._cache.hasOwnProperty(userName)) {
            resolve(this._cache[userName]);
        }
        else if (this._queue.hasOwnProperty(userName)) {
            this._queue[userName].push({resolve, reject});
        }
        else {
            this._queue[userName] = [{resolve, reject}];
            worker(this);
        }
    }
}

const worker = FunctionTools.debounce(fetcher => {
    let names = Object.keys(fetcher._queue);

    let currentQueuePart = {};
    if (names.length <= TWITCH_API_MAX_USERNAMES) {
        Object.assign(currentQueuePart, fetcher._queue);
        fetcher._queue = {};
    }
    else {
        names = names.slice(0, TWITCH_API_MAX_USERNAMES);
        for (let name of names) {
            currentQueuePart[name] = fetcher._queue[name];
            delete fetcher._queue[name];
        }
    }

    twitchAPI.request(`https://api.twitch.tv/kraken/users?login=${names.join(',')}`).then(
        /**
         * @param {Object} response
         * @property {Object[]} users
         */
        response => {
            for (let user of response.users) {
                if (currentQueuePart.hasOwnProperty(user.name)) {
                    for (let callbackSet of currentQueuePart[user.name]) {
                        callbackSet.resolve(user._id);
                    }
                }
            }
            const notExistingKeys = names.filter(name => !response.users.map(user => user.name).includes(name));
            for (let failedUser of notExistingKeys) {
                if (currentQueuePart.hasOwnProperty(failedUser)) {
                    for (let callbackSet of currentQueuePart[failedUser]) {
                        callbackSet.reject(`couldn't find user ID of ${failedUser}`);
                    }
                }
            }
        }, () => {
            for (let name of names) {
                if (currentQueuePart.hasOwnProperty(name)) {
                    for (let callbackSet of currentQueuePart[name]) {
                        callbackSet.reject('API call for user name to ID conversion failed');
                    }
                }
            }
        });
}, 200);

module.exports = new UserIDFetcher;