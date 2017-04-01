'use strict';

const {BrowserWindow} = require('electron');
const {EventEmitter} = require('events');

const appRoot = require('app-root-path');

class Window extends EventEmitter {
    constructor(name) {
        super();
        this._name = name;
        this._browserWindow = undefined;
        this._width = 1024;
        this._height = 768;
        this._frame = false;
        this._title = 'Chad';
        this._backgroundColor = '#1e1e1e';
        this._resizable = true;
        this._url = `file://${appRoot}/views/${this._name}.html`;
        this._navigatable = false;
        this._isInternal = true;
    }

    get name() {
        return this._name;
    }

    show(parentName, options) {
        if (!this._browserWindow) {
            let windowConf = this.getWindowConf();
            if (parentName) {
                let win = require('./manager').getWindow(parentName, false);
                if (win) {
                    windowConf.modal = true;
                    windowConf.parent = win._browserWindow;
                }
            }
            this._browserWindow = new BrowserWindow(windowConf);
            let optJSON = JSON.stringify(options || {});
            this.setupEvents();
            this._browserWindow.loadURL(this._url);
            if (this._isInternal) {
                let js = `window.windowLoaded && windowLoaded(BrowserWindow.fromId(${this._browserWindow.id}), ${optJSON});`;
                this._browserWindow.webContents.executeJavaScript(js);
            }
        }
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

    setupEvents() {
        this._browserWindow.on('closed', () => {
            this.emit('closed');
            this._browserWindow = null;
        });
        this._browserWindow.once('ready-to-show', () => {
            this._browserWindow.show()
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