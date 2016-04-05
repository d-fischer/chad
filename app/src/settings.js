'use strict';

const remote = require('remote');
const app = remote.app;

module.exports = new (require('electron-settings'))({
    configDirPath: app.getPath('userData')
});