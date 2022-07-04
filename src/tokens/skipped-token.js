const CommentToken = require('./comment-token');
const checkTypes = require('check-types');

/**
 * Handles skipped tokens.
 */
class SkippedToken extends CommentToken {
    static type = 'SKIPPED';

    isIgnoredToken() {
        return true;
    }

    canHandle(line) {
        checkTypes.assert.string(line);

        // line contains a skipped token
        return /^(AT|TO|TC|SP|SB).*$/.test(line);
    }

    tokenize(line, lineNumber) {
        checkTypes.assert.string(line);
        checkTypes.assert.integer(lineNumber);

        const token = new SkippedToken({ tokenTypes: this.tokenTypes });
        token.tokenized = { line, lineNumber, metadata: { line } };

        return token;
    }

    getAllowedNextTokens() {
        const {
            COMMENT_TOKEN,
            BLANK_TOKEN,
            AC_TOKEN,
            AN_TOKEN,
            AL_TOKEN,
            AH_TOKEN,
            DP_TOKEN,
            VX_TOKEN,
            VD_TOKEN,
            DB_TOKEN,
            DC_TOKEN,
            EOF_TOKEN,
            SKIPPED_TOKEN,
        } = this.tokenTypes;

        return [
            COMMENT_TOKEN,
            BLANK_TOKEN,
            AC_TOKEN,
            AN_TOKEN,
            AL_TOKEN,
            AH_TOKEN,
            DP_TOKEN,
            VX_TOKEN,
            VD_TOKEN,
            DB_TOKEN,
            DC_TOKEN,
            EOF_TOKEN,
            SKIPPED_TOKEN,
        ];
    }
}

module.exports = SkippedToken;
