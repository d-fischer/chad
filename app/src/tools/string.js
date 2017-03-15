'use strict';

class StringTools {
    static repeat(str, cnt) {
        return new Array(cnt + 1).join(str);
    }

    //noinspection JSUnusedGlobalSymbols
    static padLeft(str, length, padChar) {
        if (str.length >= length) {
            return str;
        }

        if (!padChar) {
            padChar = (typeof str === 'number') ? '0' : ' ';
        }

        str = str.toString();

        return StringTools.repeat(padChar, length - str.length) + str;
    }

    static utf8Substring(str, start, end) {
        return [...str].slice(start, end).join('');
    }
}

module.exports = StringTools;