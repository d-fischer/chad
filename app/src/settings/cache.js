'use strict';

const SettingsStore = require('./store');

class Cache extends SettingsStore {
    constructor() {
        super('cache');
    }
}

module.exports = new Cache;