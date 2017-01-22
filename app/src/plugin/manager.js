'use strict';

const PluginExecutor = require('plugin/executor');

class PluginManager {
    constructor() {
        this._plugins = {};
    }

    load(name) {
        if (name in this._plugins) {
            throw new Error(`trying to load plugin that is already loaded: '${name}'`);
        }

        this._plugins[name] = new PluginExecutor(name);
    }

    unload(name) {
        if (!(name in this._plugins)) {
            throw new Error(`trying to unload plugin that is not loaded: '${name}'`)
        }

        delete this._plugins[name];
    }

    getAll() {
        return this._plugins;
    }
}

module.exports = new PluginManager;