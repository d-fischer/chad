const {remote} = require('electron');
const {BrowserWindow, shell} = remote;
const DomEvents = require('../src/dom/events');
const DomTools = require('../src/tools/dom');

DomEvents.delegate(document.body, 'click', '.external-link', function (e) {
    e.preventDefault();
    shell.openExternal(this.href);
});

DomEvents.delegate('.tab-list', 'click', '.tab-link', function () {
    let activeTab = this.dataset.tab;
    let container = this.closest('.tab-container');
    activateTab(container, activeTab);
});

function activateTab(tabContainer, tabName) {
    let tabs = tabContainer.querySelector('.tabs');
    [].forEach.call(tabContainer.querySelectorAll('.tab-list .tab-link'), link => {
        if (link.dataset.tab === tabName ) {
            link.classList.add('active');
        }
        else {
            link.classList.remove('active');
        }
    });
    [].forEach.call(tabs.querySelectorAll('.tab'), tab => {
        if (tab.dataset.name === tabName) {
            if (!tab.classList.contains('active')) {
                tab.classList.add('active');
                tab.dispatchEvent(new Event('tab:activate'));
            }
        }
        else {
            if (tab.classList.contains('active')) {
                tab.classList.remove('active');
                tab.dispatchEvent(new Event('tab:deactivate'));
            }
        }
    });
}

DomEvents.delegate(document.body, 'mouseenter', '[data-title]', function(e) {
    if (this.dataset.title) {
        let tip = document.createElement('div');
        tip.classList.add('tooltip');
        tip.textContent = this.dataset.title;
        let left = DomTools.getScrollLeftFrom(this, document.body);
        left += this.offsetWidth / 2;
        tip.style.left = left + 'px';
        let top = DomTools.getScrollTopFrom(this, document.body);
        top += this.offsetHeight;
        tip.style.top = top + 'px';
        document.body.appendChild(tip);
        this.addEventListener('mouseleave', function removeTooltip() {
            document.body.removeChild(tip);
            this.removeEventListener('mouseleave', removeTooltip);
        });
    }
}, true);

document.body.classList.add(process.platform);