'use strict';

const Token = require('../token');

class AlternationToken extends Token {
    get literalValue() {
        return '|';
    }
}

module.exports = AlternationToken;