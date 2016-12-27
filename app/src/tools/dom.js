'use strict';

class DomTools {
    static clearChildren(node) {
        let child;
        while (child = node.lastChild) {
            node.removeChild(child);
        }
    }

    static getScrollLeftFrom(el, ancestor) {
        let offset = 0;
        do {
            if (!isNaN(el.scrollLeft)) {
                offset -= el.scrollLeft;
                offset += el.offsetLeft;
            }
        } while (el !== ancestor && (el = el.offsetParent));
        return offset;
    }

    static getScrollTopFrom(el, ancestor) {
        let offset = 0;
        do {
            if (!isNaN(el.scrollTop)) {
                offset -= el.scrollTop;
                offset += el.offsetTop;
            }
        } while (el !== ancestor && (el = el.offsetParent));
        return offset;
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

    static getTemplateContent(template) {
        return template.content.cloneNode(true);
    }

    static fixSvgUses(elem) {
        // setTimeout(() => {
            [].forEach.call(elem.querySelectorAll('use'), use => {
                //noinspection SillyAssignmentJS
                use.outerHTML = use.outerHTML;
            });
        // }, 0);
    }
}

module.exports = DomTools;