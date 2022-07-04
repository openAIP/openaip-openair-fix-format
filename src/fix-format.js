const fs = require('node:fs');
const checkTypes = require('check-types');
const Tokenizer = require('./tokenizer');
const AcToken = require('./tokens/ac-token');
const BlankToken = require('./tokens/blank-token');
const CommentToken = require('./tokens/comment-token');
const SkippedToken = require('./tokens/skipped-token');
const BaseLineToken = require('./tokens/base-line-token');

/**
 * Reads OpenAIR file from given input filepath and fixes formatting. The fixed OpenAIR string is written to
 * the configured output filepath.
 */
class FixFormat {
    /**
     * @param {{}} [options]
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * @param {{inFile: string, outFile: string}} config
     * @return {*}
     */
    async fix({ inFile, outFile }) {
        checkTypes.assert.nonEmptyString(inFile);
        checkTypes.assert.nonEmptyString(outFile);

        try {
            console.log(`Read OpenAIR file '${inFile}'`);

            await this._enforceFileExists(inFile);
            // read OpenAIR string from specified file and fix format
            const fixedOpenair = await this.fixFormat({ inFile });
            // write fixed OpenAIR string to specified file
            await this._writeFixed(outFile, fixedOpenair.join('\n'));

            console.log(`Successfully fixed OpenAIR from file '${inFile}'. Fixed file: '${outFile}'`);
        } catch (e) {
            console.log(`Failed to fix OpenAIR: ${e.message}`);
        }
    }

    /**
     * Reads the contents of the given file and fixes the format. Returns a list of fixed lines.
     *
     * @param {string} inFile
     * @return {Promise<string[]>}
     */
    async fixFormat({ inFile }) {
        checkTypes.assert.nonEmptyString(inFile);

        const formatted = [];
        const blockTokens = [];
        let readBlock = false;

        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize(inFile);

        for (let idx = 0; idx < tokens.length; idx++) {
            const token = tokens[idx];
            const nextToken = tokens[idx + 1];

            // remove subsequent blank lines, only keep a single blank line
            if (token.getType() === BlankToken.type && nextToken.getType() === BlankToken.type) {
                continue;
            } else if (
                token.getType() === BlankToken.type ||
                token.getType() === CommentToken.type ||
                token.getType() === SkippedToken.type
            ) {
                // add non aspc block tokens directly to formatted list
                formatted.push(token);
            } else {
                throw new Error('Unhandled state.');
            }
        }

        const formattedLines = [];
        for (const token of formatted) {
            if (token instanceof BaseLineToken) {
                formattedLines.push(token.getTokenized().line);
            } else {
                // dump complete airspace definition block
                formattedLines.push(...token.map((value) => value.getTokenized().line));
                // inject a single blank after airspace definition block
                formattedLines.push('');
            }
        }

        return formattedLines;
    }

    /**
     * Returns the next block token, i.e. token that is NOT a skipped, blank or comment token.
     *
     * @param {Object[]} tokens
     * @param {number} idx
     * @private
     */
    _getNextBlockToken(tokens, idx) {
        while (idx < tokens.length) {
            const token = tokens[idx];
            if (
                token.getType() !== BlankToken.type &&
                token.getType() !== CommentToken.type &&
                token.getType() !== SkippedToken.type
            ) {
                return token;
            }
            idx++;
        }
    }

    /**
     * @param {Token[]} blockTokens
     * @return {Token[]}
     * @private
     */
    _formatBlock(blockTokens) {
        const formattedTokens = [];

        for (const token of blockTokens) {
            // remove blank lines from airspace definition block
            if (token.getType() === BlankToken.type) {
                continue;
            }
            formattedTokens.push(token);
        }

        return formattedTokens;
    }

    /**
     * Enforce file exists.
     *
     * @param filepath
     *
     * @return {Promise<void>}
     * @private
     */
    async _enforceFileExists(filepath) {
        if ((await fs.existsSync(filepath)) === false) {
            throw new Error(`Specified file '${filepath}' does not exist.`);
        }
    }
}

module.exports = FixFormat;
