'use strict';

const irc = require('./src/chat/connection');
const DomEvents = require('./src/dom/events');

const initMenu = require('./src/menu');
const Dialog = require('./src/dialog');
const ChannelDialog = require('./src/dialogs/channel');
const SettingsDialog = require('./src/dialogs/settings');

const SettingsMissingError = require('./src/error/settings-missing');

const shell = require('shell');
const remote = require('remote');
const BrowserWindow = remote.require('browser-window');

initMenu();

DomEvents.delegate('.tab-list', 'click', '.tab-link', function () {
    let activeTab = this.dataset.tab;
    let container = this.closest('.tab-container');
    activateTab(container, activeTab);
});

function activateTab(tabContainer, tabName) {
    let tabs = tabContainer.querySelector('.tabs');
    [].forEach.call(tabContainer.querySelectorAll('.tab-list .tab-link'), link => {
        if (link.dataset.tab === tabName ) {
            link.classList.add('active');
        }
        else {
            link.classList.remove('active');
        }
    });
    [].forEach.call(tabs.querySelectorAll('.tab'), tab => {
        if (tab.dataset.name === tabName) {
            if (!tab.classList.contains('active')) {
                tab.classList.add('active');
                tab.dispatchEvent(new Event('tab:activate'));
            }
        }
        else {
            if (tab.classList.contains('active')) {
                tab.classList.remove('active');
                tab.dispatchEvent(new Event('tab:deactivate'));
            }
        }
    });
}

document.getElementById('active-dialog').addEventListener('click', function(e) {
    if (e.target === this) { // no bubbled events please!
        e.preventDefault();
        Dialog.hide();
    }
});

document.getElementById('channel-add').addEventListener('click', () => {
    (new ChannelDialog()).show();
});

DomEvents.delegate(document.getElementById('channel-windows'), 'submit', '.message-form', function (e) {
    e.preventDefault();
    let channelWindow = this.closest('.channel-window');
    let box = this.querySelector('.message-box');
    let message = box.value;
    box.value = '';
    irc.say(channelWindow.dataset.name, message);
});

document.body.classList.add(process.platform);

[].forEach.call(document.querySelectorAll(".system-button.min"), button => button.addEventListener("click", function () {
    const window = BrowserWindow.getFocusedWindow();
    window.minimize();
}));

[].forEach.call(document.querySelectorAll(".system-button.max"), button => button.addEventListener("click", function () {
    const window = BrowserWindow.getFocusedWindow();
    window.maximize();
}));

[].forEach.call(document.querySelectorAll(".system-button.close"), button => button.addEventListener("click", function () {
    const window = BrowserWindow.getFocusedWindow();
    window.close();
}));

[].forEach.call(document.getElementsByClassName('external-link'), link => link.addEventListener('click', function (e) {
    e.preventDefault();
    shell.openExternal(this.href);
}));

function handleConnect(...otherPromises) {
    document.getElementById('loading-status').textContent = 'Loading';
    document.getElementById('connection-warning').textContent = '';
    let loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('loading');
    loadingOverlay.classList.remove('error');
    Promise.all([...otherPromises, irc.connect()]).then(() => {
        loadingOverlay.classList.add('done');
    }, err => {
        if (!(err instanceof SettingsMissingError)) {
            loadingOverlay.classList.remove('loading');
            loadingOverlay.classList.add('error');
            document.getElementById('loading-status').textContent = 'Error loading, check your settings';
            document.getElementById('connection-warning').textContent = err.message;
        }
        (new SettingsDialog()).show('connection');
    })
}

handleConnect(new Promise(resolve => {
    if (document.readyState === 'complete') {
        resolve();
    }
    else {
        window.addEventListener('load', function loadFinished() {
            document.removeEventListener('load', loadFinished);
            resolve();
        })
    }
}));