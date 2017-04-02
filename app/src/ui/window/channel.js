'use strict';

const Window = require('ui/window/window');

class ChannelWindow extends Window {
    constructor() {
        super('channel');
        this._width = 600;
        this._height = 400;
        this._resizable = false;
    }
}

module.exports = ChannelWindow;