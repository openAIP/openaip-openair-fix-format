#!/usr/bin/env node

const FixSyntax = require('./src/fix-syntax');
const program = require('commander');

program
    .option('-f, --input-filepath <inFilepath>', 'The input file path to the openAIR file')
    .option('-o, --output-filepath <outFilepath>', 'The output filename of the fixed OpenAIR file')
    .parse(process.argv);

(async () => {
    const fixSyntax = new FixSyntax();
    try {
        await fixSyntax.fix({ inFile: program.inputFilepath, outFile: program.outputFilepath });
    } catch (e) {
        console.log(e.message);
    }
})();
