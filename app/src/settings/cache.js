'use strict';

const SettingsStore = require('settings/store');

class Cache extends SettingsStore {
    constructor() {
        super('cache');
    }
}

module.exports = new Cache;