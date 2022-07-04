const FixFormat = require('../src/fix-format');
const fs = require('node:fs');

describe('test fixing blank lines in OpenAIR file', () => {
    test('fix blank lines in single airspace definition', async () => {
        const fixFormat = new FixFormat();
        const fixedOpenair = await fixFormat.fixFormat({
            inFile: './tests/fixtures/fix-blank-lines-single-airspace.txt',
        });

        // read from expected file and remove last "blank line" in file (automatically added by IDE)
        const expected = await fs
            .readFileSync('./tests/fixtures/expected-fix-blank-lines-single-airspace.txt', 'utf-8')
            .split('\n');

        // make sure to also take "last blank line added by IDE" into account
        expect(removeBlanksAtEof(fixedOpenair).join('\n')).toEqual(removeBlanksAtEof(expected).join('\n'));
    });
    test('fix blank lines in multiple airspace definitions', async () => {
        const fixFormat = new FixFormat();
        const fixedOpenair = await fixFormat.fixFormat({
            inFile: './tests/fixtures/fix-blank-lines-multiple-airspaces.txt',
        });

        const expected = await fs
            .readFileSync('./tests/fixtures/expected-fix-blank-lines-multiple-airspaces.txt', 'utf-8')
            .split('\n');

        // make sure to also take "last blank line added by IDE" into account
        expect(removeBlanksAtEof(fixedOpenair).join('\n')).toEqual(removeBlanksAtEof(expected).join('\n'));
    });
});

/**
 * Takes a list of string and removes all blank lines at the end of the list.
 *
 * @param {string[]} lines
 * @return {string[]}
 */
function removeBlanksAtEof(lines) {
    let lastLine = lines[lines.length - 1];
    if (lastLine.trim() === '') {
        lines.pop();
        lastLine = lines[lines.length - 1];
    }

    return lines;
}
