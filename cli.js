#!/usr/bin/env node

const FixFormat = require('./src/fix-format');
const program = require('commander');

program
    .option('-f, --input-filepath <inFilepath>', 'The input file path to the openAIR file')
    .option('-o, --output-filepath <outFilepath>', 'The output filename of the fixed OpenAIR file')
    .option(
        '-E, --extend-format',
        'If true, an additional "AI" token with a unique identifier is injected into each airspace block so that the file is compatible with the extended OpenAIR format. Defaults to "false".'
    )
    .parse(process.argv);

(async () => {
    const extendFormat = program.extendFormat || false;

    const fixFormat = new FixFormat();
    try {
        await fixFormat.fix({ inFile: program.inputFilepath, outFile: program.outputFilepath, extendFormat });
    } catch (e) {
        console.log(e.message);
    }
})();
