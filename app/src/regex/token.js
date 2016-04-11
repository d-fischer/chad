'use strict';

class Token {
    constructor() {
        if (new.target === Token) {
            throw new TypeError('instantiating the abstract class Token');
        }
    }

    get literalValue() {
        return '';
    }
}

module.exports = Token;