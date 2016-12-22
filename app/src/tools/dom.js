'use strict';

class DomTools {
    static clearChildren(node) {
        let child;
        while (child = node.lastChild) {
            node.removeChild(child);
        }
    }
}

module.exports = DomTools;