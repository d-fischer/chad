'use strict';

const {NodeVM} = require('vm2');
const fs = require('fs');
const {app} = require('electron');
const PluginInterface = require('plugin/interface');

class Plugin {
    constructor(name) {
        if (!/^\w+$/.test(name)) {
            throw new Error(`trying to load invalid plugin name: '${name}'`)
        }
        this._name = name;
        this._vm = new NodeVM({
            sandbox: {
                Chad: new PluginInterface(name)
            }
        });

        fs.readFile(`${app.getPath('userData')}/plugins/${name}.js`, 'utf8', (err, code) => {
            if (err) throw err;
            this._vm.run(code);
        });
    }
}

module.exports = Plugin;