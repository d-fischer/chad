'use strict';

const URL = require('url');
const QueryString = require('querystring');

const isRenderer = require('is-electron-renderer');
let BrowserWindow;

if (isRenderer) {
    BrowserWindow = require('electron').remote.BrowserWindow;
}
else {
    BrowserWindow = require('electron').BrowserWindow;
}

let token;
let scope;
const authURL = 'https://api.twitch.tv/kraken/oauth2/authorize';
const clientId = 'etkg90uv09c04nadunxf64wp5ueqcdv';
const redirectURI = 'http://chad.bogus/login';
const scopes = ['chat_login'];

function twitchAPIRequest(url, callback) {
    let headers = {
        'Client-ID': clientId,
    };
    if (token) {
        headers.Authorization = `OAuth ${token}`;
    }
    require('../chat/connection').chatInterface.api({
        url: url,
        headers: headers
    }, (err, res, body) => {
        if (typeof callback === 'function') {
            if (err) {
                callback.call(undefined, undefined, false);
            }
            else {
                callback.call(undefined, body, true);
            }
        }
    });
}

function getTwitchAPIOAuthToken(refresh = false) {
    return new Promise((resolve, reject) => {
        if (token && !refresh) {
            resolve(token);
        }
        const redir = encodeURIComponent(redirectURI);
        let url = `${authURL}?response_type=token&client_id=${clientId}&redirect_uri=${redir}&scope=${scopes.join(' ')}`;
        if (refresh) {
            url += '&force_verify=true';
        }

        let done = false;

        const authWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            'node-integration': false,
            modal: true
        });
        authWindow.loadURL(url);
        authWindow.show();

        const handleCallback = (urlStr) => {
            let url = URL.parse(urlStr);
            let params = QueryString.parse(url.hash.substr(1));
            if (params.error || params.access_token) {
                authWindow.destroy();
                done = true;
            }
            if (params.error) {
                reject(params.error);
            }
            else if (params.access_token) {
                token = params.access_token;
                scope = params.scope;
                resolve(token);
            }
        };

        authWindow.webContents.on('will-navigate', (event, url) => {
            handleCallback(url);
        });

        authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
            handleCallback(newUrl);
        });

        authWindow.on('closed', () => {
            if (!done) {
                reject('window closed');
            }
        });
    });
}

module.exports = {
    request: twitchAPIRequest,
    getOAuthToken: getTwitchAPIOAuthToken
};