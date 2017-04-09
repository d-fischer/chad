'use strict';

class FunctionTools {
    static debounce(fn, duration) {
        let timeout;
        return function debounced() {
            let obj = this, args = arguments;
            //noinspection NestedFunctionJS
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