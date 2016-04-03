'use strict';

class StringTools {
    static repeat(str, cnt) {
        return new Array(cnt + 1).join(str);
    }

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
}

module.exports = StringTools;