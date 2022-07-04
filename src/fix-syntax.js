const fs = require('node:fs');
const checkTypes = require('check-types');

/**
 * Reads OpenAIR file from given input filepath and fixes syntax. The fixed OpenAIR string is written to
 * the configured output filepath.
 */
class FixSyntax {
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
            // read OpenAIR string from specified file and fix syntax
            const fixedOpenair = await this.fixSyntax({ inFile });
            // write fixed OpenAIR string to specified file
            await this._writeFixed(outFile, fixedOpenair.join('\n'));

            console.log(`Successfully fixed OpenAIR syntax from file '${inFile}'. Fixed file: '${outFile}'`);
        } catch (e) {
            console.log(`Failed to fix syntax: ${e.message}`);
        }
    }

    /**
     * Reads the contents of the given file and fixes the syntax. Returns the fixed string.
     *
     * @param {string} inFile
     * @return {Promise<string[]>}
     */
    async fixSyntax({ inFile }) {
        checkTypes.assert.nonEmptyString(inFile);

        let currentLine = 0;
        const fixedLines = [];
        // read a single airspace definition block into "blockLines" array as long as this flag is true
        let readBlockLines = false;
        // contains lines for a single read airspace definition block
        const blockLines = [];
        const lines = await fs.readFileSync(inFile).toString();
        // replace multiple new lines with single new line
        const preparedLines = this._reduceBlankLines(lines).split('\n');

        for (let idx = 0; idx < preparedLines.length; idx++) {
            currentLine = idx + 1;
            // get current line as string
            const lineString = preparedLines[idx].toString().trim();
            if (this._isAcLine(lineString) && readBlockLines === false) {
                // start new block
                readBlockLines = true;
                blockLines.push(lineString);
            } else if (
                (this._isAcLine(lineString) && readBlockLines === true) ||
                currentLine === preparedLines.length
            ) {
                // if new AC block starts, fix last airspace definition block lines and start new block
                const fixed = this._fixBlockLines(blockLines);
                fixedLines.push(...fixed);
                // clear block lines
                readBlockLines = false;
                blockLines.length = 0;
                // add blank at the end of block
                fixedLines.push('');
            } else if (readBlockLines) {
                // read block lines
                blockLines.push(lineString);
            } else {
                fixedLines.push(lineString);
            }
        }

        return fixedLines;
    }

    /**
     * Remove multiple subsequent blank lines from string.
     *
     * @param {string} lineString
     * @return {string}
     * @private
     */
    _reduceBlankLines(lineString) {
        return lineString.replace(/\n\s*\n/g, '\n');
    }

    _fixBlockLines(blockLines) {
        const fixedLines = [];
        for (let idx = 0; idx < blockLines.length; idx++) {
            const lineString = blockLines[idx];
            // omit subsequent blank lines or blanks inside airspace definition block
            if (
                (this._isBlankLine(lineString) && this._nextLineIsBlank(blockLines, idx)) ||
                (this._isBlankLine(lineString) && this._nextLineIsAc(blockLines, idx) === false)
            ) {
                continue;
            }
            // add line to fixed lines
            fixedLines.push(lineString);
        }

        return fixedLines;
    }

    /**
     * @param {string[]} lines
     * @param {number} idx
     * @return {boolean}
     * @private
     */
    _nextLineIsBlank(lines, idx) {
        const nextLine = lines[idx + 1];
        if (nextLine == null) return false;

        return this._isBlankLine(nextLine);
    }

    /**
     * @param {string[]} lines
     * @param {number} idx
     * @return {boolean}
     * @private
     */
    _nextLineIsAc(lines, idx) {
        const nextLine = lines[idx + 1];
        if (nextLine == null) return false;

        return this._isAcLine(nextLine);
    }

    /**
     * @param {string} line
     * @return {boolean}
     * @private
     */
    _isBlankLine(line) {
        checkTypes.assert.string(line);

        return line.length === 0;
    }

    /**
     * @param {string} line
     * @return {boolean}
     * @private
     */
    _isAcLine(line) {
        checkTypes.assert.string(line);

        return /^AC\s+.*$/.test(line);
    }

    /**
     * @param {string} outFile
     * @param {string} fixedOpenair
     *
     * @return {Promise<void>}
     * @private
     */
    async _writeFixed(outFile, fixedOpenair) {
        checkTypes.assert.nonEmptyString(outFile);
        checkTypes.assert.nonEmptyString(fixedOpenair);

        await fs.writeFileSync(outFile, fixedOpenair);
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

module.exports = FixSyntax;
