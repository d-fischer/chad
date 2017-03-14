'use strict';

if (require('is-electron-renderer') !== false) {
    throw new Error('can\'t load plugin manager from renderer');
}

const fs = require('fs');

const {app} = require('electron');
const userDataPath = app.getPath('userData');
const pluginFolder = `${userDataPath}/plugins`;

class PluginManager {
    constructor() {
        this._backgroundLoader = require('plugin/loader');
        this._windowLoaders = {};
    }

    registerWindow(window) {
        let name = window.name;
        if (name in this._windowLoaders) {
            throw new Error(`trying to register window that is already registered: '${name}'`);
        }

        if (window) {
            window._windowProxy.pluginLoader_get().then(loader => this._windowLoaders[name] = loader);
        }
    }

    unregisterWindow(window) {
        let name = window.name;
        if (!(name in this._windowLoaders)) {
            throw new Error(`trying to unregister window that is not registered: '${name}'`)
        }

        delete this._windowLoaders[name];
    }

    load(name) {
        let manifestFile = `${pluginFolder}/${name}/plugin.json`;
        let manifest = require(manifestFile);
        let absoluteFiles;
        if (manifest) {
            console.log(manifest);
        }
        else {
            absoluteFiles = {
                scripts: {
                    background: `${pluginFolder}/${name}.js`
                }
            };
        }

        let pluginFile = `${pluginFolder}/${name}.js`;
        fs.exists(pluginFile, exists => {
            if (exists) {
                if (!this._backgroundLoader.pluginLoaded(name)) {
                    this._backgroundLoader.load(name, pluginFile);
                }
            }
            else {
                throw new Error(`no suitable plugin files found for plugin '${name}'`);
            }
        });
    }
}

module.exports = new PluginManager;