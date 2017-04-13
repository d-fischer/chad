'use strict';

const UIWindow = require('ui/window/window');

class LoadingWindow extends UIWindow {
    constructor() {
        super('loading');
        this._width = 200;
        this._height = 250;
        this._resizable = false;
    }
}

module.exports = LoadingWindow;