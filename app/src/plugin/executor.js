'use strict';

const {NodeVM} = require('vm2');
const fs = require('fs');
const electron = require('electron');
const isRenderer = require('is-electron-renderer');

const Plugin = require('plugin/plugin');

let app;
if (isRenderer) {
    app = electron.remote.app;
}
else {
    app = electron.app;
}

const userDataPath = app.getPath('userData');

class PluginExecutor {
    constructor(name, domAware) {
        if (!/^\w+$/.test(name)) {
            throw new Error(`trying to load invalid plugin name: '${name}'`);
        }
        this._name = name;

        if (domAware === undefined) {
            domAware = isRenderer;
        }

        if (domAware) {
            // TODO find a way to virtualize this without crashing :(

            // actually reload plugin, clearing cache and all that
            const pluginFile = `${userDataPath}/plugins/${name}`;
            const resolvedPlugin = require.resolve(pluginFile);
            if (resolvedPlugin in require.cache) {
                delete require.cache[resolvedPlugin];
            }
            this._plugin = new (require(pluginFile))(this._name, domAware);
        }
        else {
            this._vm = new NodeVM({
                sandbox: {
                    Plugin: Plugin
                }
            });

            fs.readFile(`${userDataPath}/plugins/${name}.js`, 'utf8', (err, code) => {
                if (err) throw err;
                this._plugin = new (this._vm.run(code))(this._name, domAware);
            });
        }
    }

    getPlugin() {
        return this._plugin;
    }
}

module.exports = PluginExecutor;