'use strict';

const Token = require('regex/token');

class AlternationToken extends Token {
    get literalValue() {
        return '|';
    }
}

module.exports = AlternationToken;