const FixFormat = require('../src/fix-format');
const fs = require('node:fs');

describe('test fixing blank lines in OpenAIR file', () => {
    test('fix blank lines in single airspace definition', async () => {
        const fixFormat = new FixFormat();
        const fixedOpenair = await fixFormat.fixFormat({
            inFile: './tests/fixtures/fix-blank-lines-single-airspace.txt',
        });

        // read from expected file and remove last "blank line" in file (automatically added by IDE)
        let expected = await fs.readFileSync('./tests/fixtures/expected-fix-blank-lines-single-airspace.txt', 'utf-8');

        expect(fixedOpenair.join('\n') + '\n').toEqual(expected);
    });
    test('fix blank lines in multiple airspace definitions', async () => {
        const fixFormat = new FixFormat();
        const fixedOpenair = await fixFormat.fixFormat({
            inFile: './tests/fixtures/fix-blank-lines-multiple-airspaces.txt',
        });

        const expected = await fs
            .readFileSync('./tests/fixtures/expected-fix-blank-lines-multiple-airspaces.txt', 'utf-8')
            .toString();

        expect(fixedOpenair.join('\n')).toEqual(expected);
    });
});
