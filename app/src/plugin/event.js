'use strict';

class PluginEvent {
    constructor() {
        this._caught = false;
    }

    catchEvent() {
        this._caught = true;
    }

    get caught() {
        return this._caught;
    }
}

module.exports = PluginEvent;