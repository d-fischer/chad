'use strict';

const ExtendableError = require('./extendable');

class ChatConnectionError extends ExtendableError {}

module.exports = ChatConnectionError;