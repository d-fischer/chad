'use strict';

const BasicContextMenu = require('./basic');
const DomTools = require('../../tools/dom');

const settings = remote.require('./settings/settings');
const channelManager = remote.require('./chat/channelManager');

class SelectOptionsMenu extends BasicContextMenu {
    constructor(parentElem) {
        super(parentElem);
        this._selectElem = parentElem.querySelector('select');

        this._items = {};
        for (let option of this._selectElem.options) {
            this._items[option.value] = {
                label: option.textContent
            }
        }
    }

    _buildDom() {
        let menu = super._buildDom();
        menu.classList.add('chad-select-options');
        return menu;
    }

    _place(mouseEvent) {
        let left = DomTools.getScrollLeftFrom(this._parentElem, document.body);
        this._elem.style.left = `${left}px`;

        let top = DomTools.getScrollTopFrom(this._parentElem, document.body) + this._parentElem.offsetHeight;
        if (top + this._elem.offsetHeight > window.innerHeight) {
            top -= this._elem.offsetHeight + this._parentElem.offsetHeight;
        }
        this._elem.style.top = `${top}px`;
        this._elem.style.width = `${this._parentElem.offsetWidth}px`;
    }

    _selectItem(itemName) {
        this._selectElem.value = itemName;
        this._selectElem.dispatchEvent(new Event('change'));
    }
}

module.exports = SelectOptionsMenu;