'use strict';

class ArrayTools {
    static diff(a, b) {
        return a.filter(val => b.indexOf(val) === -1);
    }
}

module.exports = ArrayTools;