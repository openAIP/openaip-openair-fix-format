const fs = require('node:fs');
const checkTypes = require('check-types');
const Tokenizer = require('./tokenizer');
const AcToken = require('./tokens/ac-token');
const BlankToken = require('./tokens/blank-token');

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
     * Reads the contents of the given file and fixes the format. Returns the fixed string.
     *
     * @param {string} inFile
     * @return {Promise<string[]>}
     */
    async fixFormat({ inFile }) {
        checkTypes.assert.nonEmptyString(inFile);

        const fixedTokens = [];
        const blockTokens = [];
        let readBlock = false;

        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize(inFile);

        for (let idx = 0; idx < tokens.length; idx++) {
            const token = tokens[idx];
            // start reading lines for new airspace block
            if (token.getType() === AcToken.type && readBlock === false) {
                readBlock = true;
                blockTokens.push(token);
            }
            // "format" last read airspace block, add formatted lines to fix lines and start reading new airspace block
            // also handle airspace definition block at end of file
            else if (
                (token.getType() === AcToken.type && readBlock === true) ||
                (idx === tokens.length - 1 && blockTokens.length > 0)
            ) {
                readBlock = false;
                const formattedBlock = this._formatBlock(blockTokens);
                formattedBlock.forEach((token) => fixedTokens.push(token));
                blockTokens.length = 0;
                readBlock = true;
            }
            // read block lines
            else if (readBlock === true) {
                blockTokens.push(token);
            } else {
                fixedTokens.push(token);
            }
        }

        const fixedLines = [];
        for (const token of fixedTokens) {
            fixedLines.push(token.getTokenized().line);
        }

        return fixedLines;
    }

    /**
     * @param {Token[]} blockTokens
     * @return {Token[]}
     * @private
     */
    _formatBlock(blockTokens) {
        const formattedTokens = [];

        // remove blank lines from airspace definition block
        for (const token of blockTokens) {
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
