'use strict';

const PluginEventInterface = require('plugin/interface/events');

class PluginInterface {
    constructor(name) {
        this._name = name;
        this.events = new PluginEventInterface(name);
    }
}

module.exports = PluginInterface;