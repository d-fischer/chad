'use strict';

const Window = require('./window');

class SettingsWindow extends Window {
    constructor() {
        super('settings');
        this._width = 600;
        this._height = 400;
        this._backgroundColor = '#2e2e2e';
        this._resizable = false;
    }
}

module.exports = SettingsWindow;