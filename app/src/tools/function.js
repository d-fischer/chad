'use strict';

class FunctionTools {
    static debounce(fn, duration) {
        var timeout;
        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
                fn.apply(obj, args);
                timeout = null;
            }
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(delayed, duration || 500);
        };
    }
}

module.exports = FunctionTools;