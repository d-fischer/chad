'use strict';

class ArrayTools {
    static diff(a, b) {
        return a.filter(val => b.indexOf(val) === -1);
    }

    static removeItem(arr, item) {
        for (let i = arr.length - 1; i >= 0; --i) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    }

    static contains(arr, item) {
        return !!~arr.indexOf(item);
    }
}

module.exports = ArrayTools;