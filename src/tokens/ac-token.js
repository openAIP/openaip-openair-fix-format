const BaseLineToken = require('./base-line-token');
const checkTypes = require('check-types');

/**
 * @typedef AcTokenConfig
 * @type Object
 * @property {TokenTypes} tokenTypes - List of all known token types. Required to do "isAllowedNextToken" type checks.
 */

/**
 * Tokenizes "AC" airspace class definitions.
 */
class AcToken extends BaseLineToken {
    static type = 'AC';

    canHandle(line) {
        checkTypes.assert.string(line);

        // is AC line e.g. "AC D"
        return /^AC\s+.*$/.test(line);
    }

    tokenize(line, lineNumber) {
        checkTypes.assert.string(line);
        checkTypes.assert.integer(lineNumber);

        const token = new AcToken({ tokenTypes: this.tokenTypes });
        token.tokenized = { line, lineNumber, metadata: { line } };

        return token;
    }

    getAllowedNextTokens() {
        const { COMMENT_TOKEN, AN_TOKEN, SKIPPED_TOKEN } = this.tokenTypes;

        return [COMMENT_TOKEN, AN_TOKEN, SKIPPED_TOKEN];
    }
}

module.exports = AcToken;
