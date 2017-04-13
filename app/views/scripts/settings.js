"use strict";

/**
 * @external DomEvents
 * @constructs DomEvents
 */

/**
 * @external DomTools
 * @constructs DomTools
 */

/**
 * @external activateTab
 * @type {Function}
 */

/**
 *
 * @type {SettingsStore}
 */
const settings = remote.require('settings/settings');

const s = '[data-setting]';
const inputFieldSelector = `input:not([type])${s}, input[type="text"]${s}, input[type="password"]${s}`;
const selectFieldSelector = `select${s}`;
const TwitchAPI = remote.require('api/twitchAPI');

const SettingsMissingError = require('error/settings-missing');

/** @type {ChatChannelManager} */
const channelManager = remote.require('chat/channelManager');
/** @type {UIWindowManager} */
const windowManager = remote.require('ui/window/manager');

const refreshSettings = async () => {
    [].forEach.call(document.querySelectorAll(s), elem => {
        const setting = settings.get(elem.dataset.setting) || '';

        if (elem instanceof HTMLInputElement || elem instanceof HTMLSelectElement) {
            elem.value = setting;
            elem.dispatchEvent(new Event('change'));
        }
        else {
            elem.innerText = setting;
        }
    });

    let auth;
    try {
        auth = await TwitchAPI.getAuthDetails();
    }
    catch (e) {
        if (e.name === 'SettingsMissingError') {
            document.querySelector('.login-user-block .logged-in-headline').innerText = 'Not logged in';
            document.querySelector('.logged-in-username').innerText = '';
            document.querySelector('.login-user-block .change-user').innerText = 'Log in';
            document.querySelector('.login-user-block .user-picture img').src = 'img/default-user.svg';
        }
        else {
            console.log(e);
        }

        return true;
    }

    document.querySelector('.login-user-block .logged-in-headline').innerText = 'Logged in as';
    document.querySelector('.logged-in-username').innerText = auth.userName;
    document.querySelector('.login-user-block .change-user').innerText = 'Change user';

    const channel = channelManager.get(auth.userName, auth.userId);
    await channel.getData();

    document.querySelector('.login-user-block .user-picture img').src = channel.logo;
    document.querySelector('.logged-in-username').innerText = channel.displayName;

    return true;
};

window.addEventListener("unhandledrejection", function(err, promise) {
    console.log(err, promise);
});

refreshSettings();

const changeCallback = function () {
    let settingName = this.dataset.setting;
    settings.set(settingName, this.value || null);

    const settingPath = settingName.split(':');
    if (settingPath[0] === 'appearance') {
        windowManager.getWindow('main').ipcSend('update-appearance');
    }
};

DomEvents.delegate(document.body, 'blur', inputFieldSelector, changeCallback, true);
DomEvents.delegate(document.body, 'change', selectFieldSelector, changeCallback, true);

for (let panel of document.querySelectorAll('.dialog-panel')) {
    panel.addEventListener('tab:activate', function () {
        let globalButtonList = document.getElementById('panel-buttons');
        let localButtonList = this.querySelector('.panel-buttons');
        DomTools.clearChildren(globalButtonList);
        if (localButtonList) {
            for (let button of localButtonList.childNodes) {
                globalButtonList.appendChild(button.cloneNode(true));
            }
        }
    });
}

const thisBrowserWindow = remote.getCurrentWindow();

//noinspection JSUnusedLocalSymbols
function initOptions(options) {
    if (options) {
        if (options.initial) {
            document.querySelector('.reconnect-button').textContent = 'Connect';
        }
        if (options.selectedPanel) {
            activateTab(document.getElementById('settings-dialog'), options.selectedPanel);
        }
        if (options.connectError) {
            let errElem = document.getElementById('connection-warning');
            errElem.classList.remove('hidden');
            errElem.textContent = 'Connection error: ' + options.connectError;
        }
    }
}

DomEvents.delegate(document.body, 'click', '.reconnect-button', () => (remote.getGlobal('reconnect'))());
document.getElementById('close-button').addEventListener('click', () => thisBrowserWindow.close());

DomEvents.delegate(document.body, 'click', '.change-user', e => {
    e.preventDefault();
    TwitchAPI.getOAuthToken(true).then(() => {
        refreshSettings();
    });
});