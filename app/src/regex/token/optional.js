'use strict';

const Token = require('../token');

class OptionalToken extends Token {
    get literalValue() {
        return '?';
    }
}

module.exports = OptionalToken;