'use strict';

const StringTools = require('../tools/string');

class JSONPRequest {
    constructor(url, callback) {
        this._url = url;
        this._additionalCallback = callback;
        this._script = undefined;
        do {
            this._callbackName = 'jsonp' + Date.now() + StringTools.padLeft(Math.floor(Math.random() * 10000), 4);
        } while (this._callbackName in window);

        window[this._callbackName] = this.callback.bind(this);
    }

    call() {
        if (this._script) {
            console.log('Trying two calls at once...!', this);
            return;
        }
        let paramSep = this._url.indexOf('?', this._url.lastIndexOf('/')) === -1 ? '?' : '&';
        this._script = document.createElement('script');
        this._script.src = this._url + paramSep + 'api_version=3&callback=' + this._callbackName;
        this._script.onerror = () => {
            this.abort();
            if (typeof this._additionalCallback === 'function') {
                this._additionalCallback.call(undefined, undefined, false);
            }
        };
        document.body.appendChild(this._script);
    }

    abort() {
        if (this._script) {
            this._script.remove();
            this._script = undefined;
        }
    }

    callback(data) {
        this.abort();
        if (typeof this._additionalCallback === 'function') {
            this._additionalCallback.call(undefined, data, true);
        }
    }
}

module.exports = JSONPRequest;