'use strict';

class DomTools {
    static clearChildren(node) {
        var child;
        while (child = node.lastChild) {
            node.removeChild(child);
        }
    }
}

module.exports = DomTools;