'use strict';

const ExtendableError = require('./extendable');

class SettingsMissingError extends ExtendableError {}

module.exports = SettingsMissingError;