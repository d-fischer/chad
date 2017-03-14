'use strict';

const PluginExecutor = require('plugin/executor');

class PluginLoader {
    constructor(type = 'unknown') {
        this._plugins = {};
        this._type = type;
    }

    load(name, file) {
        if (this.pluginLoaded(name)) {
            throw new Error(`trying to load plugin of type ${this._type} that is already loaded: '${name}'`);
        }

        this._plugins[name] = new PluginExecutor(name, file);
    }

    unload(name) {
        if (!this.pluginLoaded(name)) {
            throw new Error(`trying to unload of type ${this._type} plugin that is not loaded: '${name}'`)
        }

        delete this._plugins[name];
    }

    getAll() {
        return this._plugins;
    }

    pluginLoaded(name) {
        return name in this._plugins;
    }
}

module.exports = new PluginLoader;