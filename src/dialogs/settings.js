'use strict';

const Dialog = require('../dialog');
const DomEvents = require('../dom/events');

const settings = require('../settings');

class SettingsDialog extends Dialog {
    constructor() {
        super('settings-dialog');
        if (!SettingsDialog.initialized) {
            this.initialize();
            SettingsDialog.initialized = true;
        }
    }

    initialize() {
        DomEvents.delegate(this._element, 'change', 'input[data-setting]', function () {
            if (this.value) {
                settings.set(this.dataset.setting, this.value);
            }
            else {
                settings.unset(this.dataset.setting);
            }
        });

        document.getElementById('reconnect-button').addEventListener('click', function() {
            Dialog.hide();
            document.getElementById('loading-overlay').classList.remove('done');
            handleConnect();
        })
    }
    
    show(section) {
        super.show();
        activateTab(this._element, section);
    }
}

module.exports = SettingsDialog;