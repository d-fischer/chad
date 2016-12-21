'use strict';

const SettingsStore = require('./store');

class Settings extends SettingsStore {
    constructor() {
        super('settings');
    }
}

module.exports = new Settings;