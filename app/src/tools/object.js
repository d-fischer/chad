'use strict';

class ObjectTools {
    static combine(keys, vals) {
        return keys.length === vals.length ? keys.reduce(function(obj, key, index) {
            obj[key] = vals[index];
            return obj;
        }, {}) : null;
    }

    static map(obj, fn) {
        return Object.assign(...Object.entries(obj).map(([key, value]) => ({[key]: fn(value)})));
    }

    static filter(obj, fn) {
        return Object.assign(...Object.entries(obj).filter(([key, value]) => fn(value, key)).map(([key, value]) => ({[key]: value})));
    }

    static isEmpty(o) {
        return Object.getOwnPropertyNames(o).length === 0;
    }
}

module.exports = ObjectTools;