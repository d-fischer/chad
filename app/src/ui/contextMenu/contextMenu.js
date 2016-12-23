'use strict';

const DomTools = require('../../tools/dom');

class ContextMenu {
    constructor(parentElem) {
        this._items = {
            oops: {
                type: 'label',
                label: 'If you see this, report a bug'
            }
        };
        this._parentElem = parentElem;
        this._elem = undefined;
    }

    _refreshDom(force = false) {
        if (!this._elem || this._elem.parentNode || force) {
            let menu = document.createElement('div');
            menu.classList.add('context-menu');

            for (let itemName in this._items) {
                if (this._items.hasOwnProperty(itemName)) {
                    let item = this._items[itemName];
                    let itemElem = document.createElement('div');
                    if (item.type === 'divider') {
                        itemElem.classList.add('context-menu-divider');
                    } else {
                        itemElem.classList.add('context-menu-item');
                        itemElem.textContent = item.label || itemName;

                        if (item.type === 'label') {
                            itemElem.classList.add('label');
                        }
                        else {
                            itemElem.onclick = () => {
                                this[itemName].call(this);
                                this.hide();
                            };
                        }
                    }
                    menu.appendChild(itemElem);
                }
            }

            this._elem = menu;
        }
    }

    show(mouseEvent) {
        if (ContextMenu.current) {
            ContextMenu.current.hide();
        }
        this._refreshDom();
        ContextMenu.current = this;
        this._parentElem.classList.add('has-context-menu');
        this._elem.style.left = `${mouseEvent.clientX}px`;
        this._elem.style.top = `${mouseEvent.clientY}px`;
        this._elem.classList.add('hidden');
        document.body.appendChild(this._elem);
        DomTools.redraw(this._elem);
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