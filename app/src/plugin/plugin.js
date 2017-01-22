'use strict';

const isRenderer = require('is-electron-renderer');

class Plugin {
    constructor(name) {
        this._name = name;
    }

    handleMessage(e) {
    }

    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    get domAware() {
        return isRenderer;
    }
}

module.exports = Plugin;