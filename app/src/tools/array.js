'use strict';

class ArrayTools {
    static diff(a, b) {
        return a.filter(val => !b.includes(val));
    }

    static removeItem(arr, item) {
        for (let i = arr.length - 1; i >= 0; --i) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    }
}

module.exports = ArrayTools;