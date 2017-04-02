"use strict";

const settings = remote.require('settings/settings');

const s = '[data-setting]';
const inputFieldSelector = `input:not([type])${s}, input[type="text"]${s}, input[type="password"]${s}`;
const selectFieldSelector = `select${s}`;
const TwitchAPI = require('../src/request/twitchAPI');

const refreshSettings = () => [].forEach.call(document.querySelectorAll(`${inputFieldSelector}, ${selectFieldSelector}`), input => {
    input.value = settings.get(input.dataset.setting) || '';
    input.dispatchEvent(new Event('change'));
});

refreshSettings();

const changeCallback = function () {
    settings.set(this.dataset.setting, this.value || null);
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

function windowLoaded(thisBrowserWindow, options) {
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
    DomEvents.delegate(document.body, 'click', '.reconnect-button', () => (remote.getGlobal('reconnect'))());
    document.getElementById('close-button').addEventListener('click', () => thisBrowserWindow.close());

    DomEvents.delegate(document.body, 'click', '.get-oauth-token', e => {
        e.preventDefault();
        TwitchAPI.getOAuthToken().then(token => {
            settings.set('connection:token', token);
            refreshSettings();
        });
    });
}