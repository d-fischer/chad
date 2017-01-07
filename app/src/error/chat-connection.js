'use strict';

const ExtendableError = require('error/extendable');

class ChatConnectionError extends ExtendableError {}

module.exports = ChatConnectionError;