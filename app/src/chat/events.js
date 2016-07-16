'use strict';

const {EventEmitter} = require('events');

class ChatEvents extends EventEmitter {
    emit(...args) {
        if (args[0] !== 'chat' && args[0] !== 'action') {
            console.log(...args);
        }
        super.emit(...args);
    }
}

module.exports = new ChatEvents;