'use strict';

const electron = require('electron');
const {Menu, app, BrowserWindow} = electron;

global['chatChannelManager'] = require('./chat/channelManager');

const settings = require('./settings');
const windowManager = require('./ui/window/manager');
const chatEvents = require('./chat/events');

let chatConnection;

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

function initConnection() {
    if (!chatConnection)
    {
        let connection = settings.getSync('connection');
        if (connection && connection.username && connection.token) {
            chatConnection = require('./chat/connection');
            chatConnection.connect().then(() => {
                let channels = settings.getSync('connection.channels') || [];
                chatChannelManager.addAll(channels);
            });

            chatEvents.on('connected', () => {
                windowManager.getWindow('main').show();
                let loadingWindow = windowManager.getWindow('loading', false);
                if (loadingWindow) {
                    loadingWindow.close();
                }
            });

            chatEvents.on('disconnected', reason => {
                console.log(`Disconnected: ${reason}`)
            });
        }
    }
}

global.reconnect = () => {
    windowManager.closeAll();
    if (chatConnection) {
        chatConnection.connect();
    }
    else {
        initConnection();
    }
    createWindow();
};

app.on('ready', function () {
    initMenu();
    initConnection();
    createWindow();
});

// TODO: tray icon for Windows here
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
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
                    role: 'reload'
                },
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

    if (process.platform == 'darwin') {
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
                        require('./ui/window/manager').getWindow('settings').show('main')
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
