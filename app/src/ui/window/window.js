'use strict';

const {BrowserWindow} = require('electron');
const {EventEmitter} = require('events');
const {createProxyForRemote} = require('electron-remote');

const appRoot = require('app-root-path');

const pluginManager = require('plugin/manager');

class Window extends EventEmitter {
    constructor(name) {
        super();
        this._name = name;
        this._browserWindow = undefined;
        this._windowProxy = undefined;
        this._width = 1024;
        this._height = 768;
        this._frame = false;
        this._title = 'Chad';
        this._backgroundColor = '#1e1e1e';
        this._resizable = true;
        this._url = `file://${appRoot}/views/${this._name}.html`;
        this._navigatable = false;
        this._isInternal = true;
        this._promise = undefined;
    }

    get name() {
        return this._name;
    }

    show(parentName, options) {
        if (this._promise) {
            return this._promise;
        }

        return this._promise = new Promise((resolve, reject) => {
            if (this._browserWindow) {
                resolve();
            }
            else {
                let windowConf = this.getWindowConf();
                if (parentName) {
                    let win = require('ui/window/manager').getWindow(parentName, false);
                    if (win) {
                        windowConf.modal = true;
                        windowConf.parent = win._browserWindow;
                    }
                }
                this._browserWindow = new BrowserWindow(windowConf);

                this.setupEvents(resolve, reject, options);
                this._browserWindow.loadURL(this._url);
            }
        });
    }

    getWindowConf() {
        return {
            width: this._width,
            height: this._height,
            title: this._title,
            frame: this._frame,
            backgroundColor: this._backgroundColor,
            resizable: this._resizable,
            show: false,
            transparent: !(this._resizable || this._frame),
            webPreferences: {
                nodeIntegration: this._isInternal
            }
        };
    }

    setupEvents(resolve, reject, options) {
        this._browserWindow.webContents.once('dom-ready', () => {
            this._loaded = true;

            if (this._isInternal) {
                let optJson = JSON.stringify(options || {});
                this._browserWindow.webContents.executeJavaScript(`window.initOptions && initOptions(${optJson})`);
                this._browserWindow.webContents.executeJavaScript('require(\'electron-remote\').initializeEvalHandler();');
                this._windowProxy = createProxyForRemote(this._browserWindow);
                pluginManager.registerWindow(this);
            }

            resolve();
        });

        this._browserWindow.on('closed', () => {
            this.emit('closed');
            pluginManager.unregisterWindow(this);
            this._browserWindow = undefined;
            this._windowProxy = undefined;
            this._promise = undefined;
            if (!this._loaded) {
                reject();
            }
            this._loaded = false;
        });
        this._browserWindow.once('ready-to-show', () => {
            this._browserWindow.show();
        });
        if (!this._navigatable) {
            this._browserWindow.webContents.on('will-navigate', e => e.preventDefault());
        }
    }

    close() {
        this._browserWindow && this._browserWindow.close();
    }
}

module.exports = Window;