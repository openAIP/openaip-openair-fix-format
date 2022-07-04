#!/usr/bin/env node

const FixFormat = require('./src/fix-format');
const program = require('commander');

program
    .option('-f, --input-filepath <inFilepath>', 'The input file path to the openAIR file')
    .option('-o, --output-filepath <outFilepath>', 'The output filename of the fixed OpenAIR file')
    .parse(process.argv);

(async () => {
    const fixFormat = new FixFormat();
    try {
        await fixFormat.fix({ inFile: program.inputFilepath, outFile: program.outputFilepath });
    } catch (e) {
        console.log(e.message);
    }
})();
