const FixSyntax = require('../src/fix-syntax');
const fs = require('node:fs');

describe('test fixing blank lines in OpenAIR syntax', () => {
    test('fix blank lines in single airspace definition', async () => {
        const fixSyntax = new FixSyntax();
        const fixedOpenair = await fixSyntax.fixSyntax({
            inFile: './tests/fixtures/fix-blank-lines-single-airspace.txt',
        });

        // read from expected file and remove last "blank line" in file (automatically added by IDE)
        let expected = await fs
            .readFileSync('./tests/fixtures/expected-fix-blank-lines-single-airspace.txt', 'utf-8')
            .toString();

        expect(fixedOpenair.join('\n')).toEqual(expected);
    });
    test('fix blank lines in multiple airspace definitions', async () => {
        const fixSyntax = new FixSyntax();
        const fixedOpenair = await fixSyntax.fixSyntax({
            inFile: './tests/fixtures/fix-blank-lines-multiple-airspaces.txt',
        });

        const expected = await fs
            .readFileSync('./tests/fixtures/expected-fix-blank-lines-multiple-airspaces.txt', 'utf-8')
            .toString();

        expect(fixedOpenair.join('\n')).toEqual(expected);
    });
});
