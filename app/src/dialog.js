'use strict';

const settings = require('./settings');

class Dialog {
    constructor(id) {
        if (this.constructor === Dialog) {
            throw new Error('could not instantiate abstract class');
        }
        this._element = document.getElementById(id);
    }

    show() {
        let dialog = this._element;
        [].forEach.call(dialog.querySelectorAll('input[data-setting]'), input => {
            input.value = settings.get(input.dataset.setting) || '';
        });
        let activeDialogWrapper = document.getElementById('active-dialog');
        activeDialogWrapper.appendChild(dialog);
        dialog.scrollWidth;
        activeDialogWrapper.classList.remove('hidden');
    }

    static hide() {
        let dialogs = document.getElementById('dialogs');
        let activeDialog = document.querySelector('#active-dialog');
        activeDialog.classList.add('hidden');
        activeDialog.addEventListener('transitionend', function endTransition() {
            dialogs.appendChild(activeDialog.querySelector('.dialog'));
            activeDialog.removeEventListener('transitionend', endTransition);
        });
    }
}

module.exports = Dialog;