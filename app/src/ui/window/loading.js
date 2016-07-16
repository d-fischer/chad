'use strict';

const Window = require('./window');

class LoadingWindow extends Window {
    constructor() {
        super('loading');
        this._width = 200;
        this._height = 250;
        this._resizable = false;
    }
}

module.exports = LoadingWindow;