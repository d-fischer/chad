const settings = remote.require('./settings/settings');

const DomTools = require('./../src/tools/dom');

[].forEach.call(document.querySelectorAll('input[data-setting]'), input => {
    input.value = settings.get(input.dataset.setting) || '';
});

DomEvents.delegate(document.body, 'blur', 'input[data-setting]', function () {
    if (this.value) {
        settings.set(this.dataset.setting, this.value);
    }
    else {
        settings.delete(this.dataset.setting);
    }
}, true);

for (let panel of document.querySelectorAll('.dialog-panel')) {
    panel.addEventListener('tab:activate', function () {
        let globalButtonList = document.getElementById('panel-buttons');
        let localButtonList = this.querySelector('.panel-buttons');
        DomTools.clearChildren(globalButtonList);
        if (localButtonList) {
            for (let button of localButtonList.childNodes) {
                globalButtonList.appendChild(button.cloneNode(true));
            }
        }
    });
}

function windowLoaded(thisBrowserWindow, options) {
    if (options) {
        if (options.initial) {
            document.querySelector('.reconnect-button').textContent = 'Connect';
        }
        if (options.selectedPanel) {
            activateTab(document.getElementById('settings-dialog'), options.selectedPanel);
        }
    }
    DomEvents.delegate(document.body, 'click', '.reconnect-button', () => (remote.getGlobal('reconnect'))());
    document.getElementById('close-button').addEventListener('click', () => thisBrowserWindow.close());
}