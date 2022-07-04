const BaseLineToken = require('./base-line-token');
const checkTypes = require('check-types');

/**
 * Tokenizes "AH" airspace upper ceiling definitions.
 */
class AhToken extends BaseLineToken {
    static type = 'AH';

    canHandle(line) {
        checkTypes.assert.string(line);

        // is AH line e.g. "AH 40000ft MSL"
        return /^AH\s+.*$/.test(line);
    }

    tokenize(line, lineNumber) {
        checkTypes.assert.string(line);
        checkTypes.assert.integer(lineNumber);

        const token = new AhToken({ tokenTypes: this.tokenTypes });
        token.tokenized = { line, lineNumber, metadata: { line } };

        return token;
    }

    getAllowedNextTokens() {
        const { COMMENT_TOKEN, AL_TOKEN, DP_TOKEN, VW_TOKEN, VX_TOKEN, SKIPPED_TOKEN, VD_TOKEN } = this.tokenTypes;

        return [COMMENT_TOKEN, AL_TOKEN, DP_TOKEN, VW_TOKEN, VX_TOKEN, SKIPPED_TOKEN, VD_TOKEN];
    }
}

module.exports = AhToken;
