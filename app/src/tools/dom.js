'use strict';

class DomTools {
    static clearChildren(node) {
        let child;
        while (child = node.lastChild) {
            node.removeChild(child);
        }
    }

    static doAfterTransition(elem, fn) {
        let transTime = window.getComputedStyle(elem).transitionDuration;

        if (transTime === '0s' || !transTime)
        {
            fn.call(elem);
        }
        else
        {
            let transitionEnd       = () =>
            {
                fn.call(elem);
                elem.removeEventListener('transitionend', transitionEnd);
            };
            elem.addEventListener('transitionend', transitionEnd);
        }
    }

    static redraw(elem) {
        //noinspection BadExpressionStatementJS
        elem.scrollHeight;
    }
}

module.exports = DomTools;