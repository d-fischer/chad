'use strict';

const DomTools = require('../../tools/dom');

class ContextMenu {
    constructor(parentElem) {
        this._parentElem = parentElem;
        this._elem = undefined;
    }

    _refreshDom(force = false) {
        if (!this._elem || this._elem.parentNode || force) {
            this._elem = this._buildDom();
        }
    }

    _place(mouseEvent) {
        let left = mouseEvent.clientX;
        if (left + this._elem.offsetWidth > window.innerWidth) {
            left -= this._elem.offsetWidth;
        }
        this._elem.style.left = `${left}px`;

        let top = mouseEvent.clientY;
        if (top + this._elem.offsetHeight > window.innerHeight) {
            top -= this._elem.offsetHeight;
        }
        this._elem.style.top = `${top}px`;
    }

    show(mouseEvent) {
        if (ContextMenu.current) {
            ContextMenu.current.hide();
        }
        this._refreshDom();
        ContextMenu.current = this;
        this._parentElem.classList.add('has-context-menu');
        this._elem.classList.add('hidden');
        document.body.appendChild(this._elem);
        DomTools.redraw(this._elem);
        this._place(mouseEvent);
        this._elem.classList.remove('hidden');
    }

    hide() {
        this._parentElem.classList.remove('has-context-menu');
        DomTools.doAfterTransition(this._elem, function () {
            document.body.removeChild(this);
            this.classList.remove('hidden');
        });
        this._elem.classList.add('hidden');
        ContextMenu.current = null;
    }
}

document.body.addEventListener('click', e => {
    if (ContextMenu.current && (!ContextMenu.current._elem || !ContextMenu.current._elem.contains(e.target))) {
        ContextMenu.current.hide();
        e.stopImmediatePropagation();
    }
}, true);

module.exports = ContextMenu;