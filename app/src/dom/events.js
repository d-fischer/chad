'use strict';

class DomEvents {
    static delegate(parent, event, childSel, callback, useCapture) {
        if (typeof parent === 'string') {
            parent = document.querySelectorAll(parent);
        }
        if (parent instanceof NodeList) {
            [].forEach.call(parent, parentElem => {
                DomEvents.delegate(parentElem, event, childSel, callback)
            });
        }
        else {
            parent.addEventListener(event, function (e) {
                let child;
                if (child = e.target.closest(childSel)) {
                    callback.call(child, e);
                }
            }, !!useCapture);
        }
    }
}

module.exports = DomEvents;