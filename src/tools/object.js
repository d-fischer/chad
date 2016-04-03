'use strict';

class ObjectTools {
    static combine(keys, vals) {
        return keys.length === vals.length ? keys.reduce(function(obj, key, index) {
            obj[key] = vals[index];
            return obj;
        }, {}) : null;
    }
}

module.exports = ObjectTools;