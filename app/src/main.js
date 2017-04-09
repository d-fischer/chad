'use strict';

require('app-module-path').addPath(__dirname);

const electron = require('electron');
//noinspection JSUnusedLocalSymbols
const {Menu, app, BrowserWindow} = electron;

global['chatChannelManager'] = require('chat/channelManager');

const settings = require('settings/settings');
const windowManager = require('ui/window/manager');
const chatEvents = require('chat/events');
//noinspection JSUnusedLocalSymbols
const pluginEvents = require('plugin/events');

// this needs to exist early for the emote event to be registered before connecting
//noinspection JSUnusedLocalSymbols
const chatEmotes = require('./chat/emotes');

let chatConnection;
let initialConnection = false;

function createWindow() {
    if (chatConnection) {
        if (chatConnection.isConnecting) {
             windowManager.getWindow('loading').show();
        } else if (chatConnection.isConnected) {
             windowManager.getWindow('main').show();
        }
    }
    else {
         windowManager.getWindow('settings').show(null, { initial: true, selectedPanel: 'connection' });
    }
}

function initConnection(allowReconnect) {
    if (chatConnection && allowReconnect) {
        chatConnection = undefined;
    }
    if (!chatConnection)
    {
        let connection = settings.get('connection');
        if (connection && connection.username && connection.token) {
            chatConnection = require('chat/connection');
            chatConnection.connect().then(() => {
                let channels = settings.get('connection:channels') || [];
                chatChannelManager.joinAll(channels);
            });

            initialConnection = true;
            chatEvents.on('connected', () => {
                if (initialConnection) {
                    initialConnection = false;
                    windowManager.getWindow('main').show();
                    let loadingWindow = windowManager.getWindow('loading', false);
                    if (loadingWindow) {
                        loadingWindow.close();
                    }
                }
            });

            chatEvents.on('disconnected', reason => {
                if (initialConnection) {
                    initialConnection = false;
                    windowManager.getWindow('settings').show(null, {
                        initial: true,
                        selectedPanel: 'connection',
                        connectError: reason
                    });
                    let loadingWindow = windowManager.getWindow('loading', false);
                    if (loadingWindow) {
                        loadingWindow.close();
                    }
                }
            });
        }
    }
}

global.reconnect = () => {
    initialConnection = true;
    windowManager.closeAll();
    initConnection(true);
    createWindow();
};

app.on('ready', function () {
    initMenu();
    initConnection();
    createWindow();
});

// TODO: tray icon for Windows here
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin' && !initialConnection) {
        app.quit();
    }
});

app.on('activate', function () {
    if (!windowManager.anyOpened()) {
        initConnection();
        createWindow();
    }
});

function initMenu() {
    let template = [
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
                {
                    role: 'pasteandmatchstyle'
                },
                {
                    role: 'delete'
                },
                {
                    role: 'selectall'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    role: 'toggledevtools'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetzoom'
                },
                {
                    role: 'zoomin'
                },
                {
                    role: 'zoomout'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    role: 'minimize'
                },
                {
                    role: 'close'
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        let name = app.getName();
        template.unshift({
            label: name,
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Preferences',
                    accelerator: 'Command+,',
                    click: function () {
                        require('ui/window/manager').getWindow('settings').show('main')
                    }
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        });

        template[1].submenu.push(
            {
                type: 'separator'
            },
            {
                label: 'Speech',
                submenu: [
                    {
                        role: 'startspeaking'
                    },
                    {
                        role: 'stopspeaking'
                    }
                ]
            }
        );

        template[3].submenu = [
            {
                role: 'close'
            },
            {
                role: 'minimize'
            },
            {
                role: 'zoom'
            },
            {
                type: 'separator'
            },
            {
                role: 'front'
            }
        ];
    }

    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
