'use strict';

const ContextMenu = require('ui/contextMenu/contextMenu');

class BasicContextMenu extends ContextMenu {
    constructor(parentElem) {
        super(parentElem);

        this._items = {
            oops: {
                type: 'label',
                label: 'If you see this, report a bug'
            }
        };
        this._toggleElems = {};
    }

    _buildDom() {
        let menu = document.createElement('div');
        menu.classList.add('context-menu');
        this._toggleElems = {};

        let hasIcon = false;

        for (let itemName in this._items) {
            if (this._items.hasOwnProperty(itemName)) {
                let item = this._items[itemName];
                let itemElem = document.createElement('div');
                if (item.type === 'divider') {
                    itemElem.classList.add('context-menu-divider');
                } else {
                    itemElem.classList.add('context-menu-item');
                    if (item.type) {
                        itemElem.classList.add(item.type);
                    }
                    itemElem.textContent = item.label || itemName;

                    if (item.type === 'label') {
                        itemElem.classList.add('label');
                    }
                    else if (item.type === 'toggle') {
                        this._toggleElems[itemName] = itemElem;
                    }

                    if (item.icon) {
                        hasIcon = true;
                        itemElem.style.backgroundImage = `url(img/${item.icon}.svg)`;
                    }

                    if (item.type !== 'label') {
                        itemElem.onclick = () => {
                            this._selectItem(itemName);
                            this.hide();
                        };
                    }
                }
                menu.appendChild(itemElem);
            }
        }

        if (hasIcon) {
            menu.classList.add('has-icon');
        }
        return menu;
    }

    show(mouseEvent) {
        super.show(mouseEvent);
        if (this._toggleElems) {
            for (let toggleName in this._toggleElems) {
                if (this._toggleElems.hasOwnProperty(toggleName)) {
                    let toggleEnabledFn = this[toggleName + '__state'];
                    if (toggleEnabledFn && toggleEnabledFn.call(this)) {
                        this._toggleElems[toggleName].classList.add('enabled');
                    }
                    else {
                        this._toggleElems[toggleName].classList.remove('enabled');
                    }
                }
            }
        }
    }

    _selectItem(itemName) {
        this[itemName].call(this);
    }
}

module.exports = BasicContextMenu;