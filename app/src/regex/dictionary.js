'use strict';

const OpenGroupToken = require('regex/token/open-group');
const CloseGroupToken = require('regex/token/close-group');
const AlternationToken = require('regex/token/alternation');
const CharacterToken = require('regex/token/character');
const OptionalToken = require('regex/token/optional');

class RegexDictionary {
    static getAllMatches(regex) {
        let dict = new RegexDictionary(regex);
        return dict.getAllMatches();
    }

    constructor(regex) {
        this._regex = regex;
        this._tokens = [];
        this._groupedTokens = [];
    }

    tokenize() {
        this._tokens = [];
        let literalNext = false;
        let currentDepth = 0;
        for (let i = 0; i < this._regex.length; ++i) {
            let char = this._regex[i];
            if (literalNext) {
                literalNext = false;
                this._tokens.push(new CharacterToken(char));
                continue;
            }
            switch (char) {
                case '(':
                case '[':
                    this._tokens.push(new OpenGroupToken(++currentDepth));
                    break;
                case ')':
                case ']':
                    this._tokens.push(new CloseGroupToken(currentDepth--));
                    break;
                case '\\':
                    literalNext = true;
                    break;
                case '?':
                    // drop "non-capturing group" regex feature - we don't capture anyway
                    if (this._regex[i + 1] === ':' && this._tokens[this._tokens.length - 1] instanceof OpenGroupToken) {
                        i++;
                    }
                    else {
                        this._tokens.push(new OptionalToken);
                    }
                    break;
                case '|':
                    this._tokens.push(new AlternationToken);
                    break;
                default:
                    this._tokens.push(new CharacterToken(char));
                    break;
            }
        }
    }

    group() {
        let innerGroup = tokens => {
            let token;
            let groupedTokens = [];
            let currentAlternative = [];
            while (token = tokens.shift()) {
                if (token instanceof OpenGroupToken) {
                    let currentDepth = token.currentDepth;
                    let tokensInGroup = [];
                    let tokenInGroup;
                    while (tokenInGroup = tokens.shift()) {
                        if (tokenInGroup instanceof CloseGroupToken) {
                            if (tokenInGroup.currentDepth === currentDepth) {
                                currentAlternative.push(innerGroup(tokensInGroup));
                                break;
                            }
                        }
                        tokensInGroup.push(tokenInGroup);
                    }
                }
                else if (token instanceof AlternationToken) {
                    groupedTokens.push(currentAlternative);
                    currentAlternative = [];
                }
                else if (token instanceof OptionalToken) {
                    if (!currentAlternative.length) {
                        throw new Error('invalid use of optional (question mark) token');
                    }
                    let lastToken = currentAlternative.pop();
                    currentAlternative.push([[lastToken], []]);
                }
                else {
                    currentAlternative.push(token);
                }
            }
            if (currentAlternative.length) {
                groupedTokens.push(currentAlternative);
            }
            return groupedTokens;
        };

        this._groupedTokens = innerGroup(this._tokens);
    }

    getAllMatches() {
        this.tokenize();
        this.group();

        return (function evaluateAlternatives(groupedTokens, results) {
            return [].concat.apply([], groupedTokens.map(tokenList => {
                return tokenList.reduce((carry, token) => {
                    if (token instanceof Array) {
                        return evaluateAlternatives(token, carry);
                    }
                    else {
                        return carry.map(value => value + token.literalValue);
                    }
                }, results);
            }));
        })(this._groupedTokens, ['']);
    }
}

module.exports = {getAllMatches: RegexDictionary.getAllMatches.bind(RegexDictionary)};