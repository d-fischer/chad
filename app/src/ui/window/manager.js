'use strict';

const ObjectTools = require('tools/object');

class UIWindowManager {
    constructor() {
        /**
         * @type {Object.<string, UIWindow>}
         * @private
         */
        this._windows = {};
    }

    /**
     * @param {string} name
     * @param {boolean} construct
     * @returns {UIWindow}
     */
    getWindow(name, construct = true) {
        if (this._windows[name]) {
            return this._windows[name];
        }
        else if (construct) {
            let cls = require('ui/window/' + name);
            if (cls) {
                let wnd = new cls();
                wnd.on('closed', () => this.destroyWindow(name));
                this._windows[name] = wnd;
                return wnd;
            }
        }

        return null;
    }

    destroyWindow(name) {
        delete this._windows[name];
    }

    closeAll() {
        for (let wnd of Object.keys(this._windows).reverse()) {
            if (this._windows.hasOwnProperty(wnd)) {
                this._windows[wnd].close();
            }
        }
    }

    /**
     * @returns {boolean}
     */
    anyOpened() {
        return !ObjectTools.isEmpty(this._windows);
    }
}

module.exports = new UIWindowManager;