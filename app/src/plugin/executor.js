'use strict';

const {NodeVM} = require('vm2');
const fs = require('fs');
const path = require('path');
const isRenderer = require('is-electron-renderer');

const Plugin = require('plugin/plugin');

class PluginExecutor {
    constructor(name, file) {
        this._name = name;

        if (isRenderer) {
            // TODO find a way to virtualize this without crashing :(

            // actually reload plugin, clearing cache and all that. the files might have changed!
            const resolvedPlugin = require.resolve(file);
            if (resolvedPlugin in require.cache) {
                delete require.cache[resolvedPlugin];
            }
            this._plugin = new (require(file))(this._name);
        }
        else {
            this._vm = new NodeVM({
                require: {
                    external: true,
                    builtin: ['fs', 'path'],
                    context: 'sandbox'
                }
            });

            fs.readFile(file, 'utf8', (err, code) => {
                if (err) throw err;
                let cls = this._vm.run(code, path.join(__dirname, '../main.js'));
                this._plugin = new cls(this._name);
            });
        }
    }

    getPlugin() {
        return this._plugin;
    }
}

module.exports = PluginExecutor;