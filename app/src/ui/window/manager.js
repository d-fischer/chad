'use strict';

const Window = require('./window');

const ObjectTools = require('../../tools/object');

class WindowManager {
    constructor() {
        this._windows = {};
    }

    getWindow(name, construct = true) {
        if (this._windows[name]) {
            return this._windows[name];
        }
        else if (construct) {
            let cls = require('./' + name);
            if (cls) {
                let wnd = new cls();
                wnd.on('closed', () => this.destroyWindow(name));
                return this._windows[name] = wnd;
            }
        }

        return null;
    }

    destroyWindow(wnd) {
        let wndName;
        wndName = (wnd instanceof Window) ? wnd.name : wnd;
        delete this._windows[wndName];
    }

    closeAll() {
        for (let wnd of Object.keys(this._windows).reverse()) {
            if (this._windows.hasOwnProperty(wnd)) {
                this._windows[wnd].close();
            }
        }
    }

    anyOpened() {
        return !ObjectTools.isEmpty(this._windows);
    }
}

module.exports = new WindowManager();