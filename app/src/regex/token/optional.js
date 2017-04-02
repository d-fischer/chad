'use strict';

const Token = require('regex/token');

class OptionalToken extends Token {
    get literalValue() {
        return '?';
    }
}

module.exports = OptionalToken;