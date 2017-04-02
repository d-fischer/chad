'use strict';

const SettingsStore = require('settings/store');

class Settings extends SettingsStore {
    constructor() {
        super('settings');
    }
}

module.exports = new Settings;