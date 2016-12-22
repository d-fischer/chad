'use strict';

const Plugin = require('./plugin');
const pluginEvents = require('./events');

class PluginManager {
    constructor() {
        this._plugins = {};
    }

    load(name) {
        if (name in this._plugins) {
            throw new Error(`trying to load plugin that is already loaded: '${name}'`);
        }

        this._plugins[name] = new Plugin(name);
    }

    unload(name) {
        if (!(name in this._plugins)) {
            throw new Error(`trying to unload plugin that is not loaded: '${name}'`)
        }

        pluginEvents._removeAllForPlugin(name);
        delete this._plugins[name];
    }
}

module.exports = new PluginManager;