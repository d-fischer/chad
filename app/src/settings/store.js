'use strict';

const nconf = require('nconf');
const path = require('path');
const {app} = require('electron');

let _instances = {};

class SettingsStore {
    constructor(name) {
        this._name = name;
        this._nconf = new nconf.Provider();
        _instances[name] = this;
        this._nconf.file(path.join(app.getPath('userData'), name + '.json'));
    }

    get(key) {
        return this._nconf.get(key);
    }

    set(key, value) {
        let result = this._nconf.set(key, value);
        this._nconf.save();
        return result;
    }

    delete(key) {
        let result = this._nconf.remove(key);
        this._nconf.save();
        return result;
    }
}

module.exports = SettingsStore;