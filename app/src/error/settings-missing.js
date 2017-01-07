'use strict';

const ExtendableError = require('error/extendable');

class SettingsMissingError extends ExtendableError {}

module.exports = SettingsMissingError;