'use strict';

const Token = require('../token');

class CloseGroupToken extends Token {
    constructor(currentDepth) {
        super();
        this._currentDepth = currentDepth;
    }

    get currentDepth() {
        return this._currentDepth;
    }

    get literalValue() {
        return ')';
    }
}

module.exports = CloseGroupToken;