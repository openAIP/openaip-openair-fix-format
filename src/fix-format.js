const fs = require('node:fs');
const checkTypes = require('check-types');
const Tokenizer = require('./tokenizer');
const AcToken = require('./tokens/ac-token');
const BlankToken = require('./tokens/blank-token');
const CommentToken = require('./tokens/comment-token');
const SkippedToken = require('./tokens/skipped-token');
const EofToken = require('./tokens/eof-token');

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
     * @return {void}
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

            // end of file
            if (token.getType() === EofToken.type) {
                break;
            }

            // remove subsequent blank lines, only keep a single blank line
            if (token.getType() === BlankToken.type && nextToken.getType() === BlankToken.type) {
                continue;
            }

            if (readBlock) {
                if (this._isBlockToken(tokens, idx)) {
                    blockTokens.push(token.getTokenized().line);
                } else {
                    readBlock = false;
                    formatted.push(...this._formatBlock(blockTokens));
                    blockTokens.length = 0;
                }
            } else {
                // read "in-between-blocks" comments and blanks
                if (
                    token.getType() === BlankToken.type ||
                    token.getType() === CommentToken.type ||
                    token.getType() === SkippedToken.type
                ) {
                    // add non aspc block tokens directly to formatted list
                    formatted.push(token.getTokenized().line);
                }
                // start reading new airspace definition block
                else if (token.getType() === AcToken.type) {
                    readBlock = true;
                    blockTokens.push(token.getTokenized().line);
                } else {
                    throw new Error('Unhandled state.');
                }
            }
        }

        const fixed = [];
        let lastLine = null;
        for (const line of formatted) {
            if (line === '' && lastLine === '') {
                continue;
            }
            fixed.push(line);
        }

        return fixed;
    }

    /**
     * Check that token at the given idx is inside an airspace definition block.
     *
     * @param {Object[]} tokens
     * @param {number} idx
     * @return {boolean}
     * @private
     */
    _isBlockToken(tokens, idx) {
        const nextBlockToken = this._getNextBlockToken(tokens, idx);

        // if next block token is NOT an AC token, the token is considered to be inside an airspace definition block
        return nextBlockToken.getType() !== AcToken.type && nextBlockToken.getType() !== EofToken.type;
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
     * @param {string[]} blockLines
     * @return {string[]}
     * @private
     */
    _formatBlock(blockLines) {
        const formattedTokens = [];

        for (const line of blockLines) {
            // remove blank lines from airspace definition block
            if (line === '') {
                continue;
            }
            formattedTokens.push(line);
        }
        // add a blank line after each airspace definition block
        formattedTokens.push('');

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
