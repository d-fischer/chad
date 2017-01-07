'use strict';

const Window = require('ui/window/window');

const URL = require('url');
const QueryString = require('querystring');

class AuthWindow extends Window {
    constructor() {
        super('settings');
        this._width = 400;
        this._height = 400;
        this._backgroundColor = 'white';
        this._resizable = false;
        this._frame = true;
        this._navigatable = true;
        this._url = 'https://api.twitch.tv/kraken/oauth2/authorize?response_type=token' +
            '&client_id=etkg90uv09c04nadunxf64wp5ueqcdv&redirect_uri=chad:login&scope=chat_login';
        this._isInternal = false;
        this._promise = undefined;
    }

    show(...args) {
        if (this._promise) {
            return this._promise;
        }
        else {
            super.show(...args);

            let done = false;

            return new Promise((resolve, reject) => {
                this._browserWindow.on('closed', () => {
                    this._promise = null;
                    if (!done) {
                        reject();
                    }
                });

                this._browserWindow.webContents.on('did-get-redirect-request', function (e, oldUrl, newUrl) {
                    let url = URL.parse(newUrl);
                    if (url.protocol === 'chad:' && url.hostname === 'login') {
                        let params = QueryString.parse(url.hash.substr(1));
                        resolve({
                            token: params.access_token,
                            scope: params.scope
                        });
                    }
                });
            });
        }
    }
}

module.exports = AuthWindow;