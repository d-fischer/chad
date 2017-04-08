'use strict';

const URL = require('url');
const QueryString = require('querystring');

const isRenderer = require('is-electron-renderer');
let BrowserWindow, settings;

if (isRenderer) {
    let remote = require('electron').remote;
    BrowserWindow = remote.BrowserWindow;
    settings = remote.require('settings/settings');
}
else {
    BrowserWindow = require('electron').BrowserWindow;
    settings = require('settings/settings');
}

const authURL = 'https://api.twitch.tv/kraken/oauth2/authorize';
const clientId = 'etkg90uv09c04nadunxf64wp5ueqcdv';
const redirectURI = 'http://chad.bogus/login';
const scopes = ['chat_login'];

let token = settings.get('connection:token');
let authDetails;
let authDetailsRefreshStamp = 0;

function twitchAPIRequest(url) {
    return new Promise((resolve, reject) => {
        if (url.search(/^https?:\/\//) === -1) {
            url = 'https://' + url;
        }
        let headers = {
            'Client-ID': clientId,
        };
        if (token) {
            headers.Authorization = `OAuth ${token}`;
        }
        require('chat/connection').chatInterface.api({
            url: url,
            headers: headers
        }, (err, res, body) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(body);
            }
        });
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
                getTwitchAuthDetails().then(authDetails => {
                    settings.set('connection:username', authDetails.userName);
                    settings.set('connection:token', token = params.access_token);
                    resolve(token);
                }, reject);
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

function getTwitchAuthDetails() {
    return new Promise((resolve, reject) => {
        if (!token) {
            reject();
        }
        // cache for 5 minutes
        else if (authDetailsRefreshStamp + 5 * 60 * 1000 > Date.now()) {
            resolve(authDetails);
        }
        else {
            twitchAPIRequest('https://api.twitch.tv/kraken/').then(data => {
                if (typeof data === 'object' && data.token.valid) {
                    authDetails = {
                        userName: data.token.user_name,
                        scopes: data.token.authorization.scopes
                    };
                    authDetailsRefreshStamp = Date.now();
                    resolve(authDetails);
                }
                else {
                    reject();
                }
            }, reject);
        }
    });
}

module.exports = {
    request: twitchAPIRequest,
    getOAuthToken: getTwitchAPIOAuthToken,
    getAuthDetails: getTwitchAuthDetails
};