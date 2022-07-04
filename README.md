# OpenAIR Fix Syntax

A utility that fixes [OpenAIR](http://www.winpilot.com/usersguide/userairspace.asp) syntax for Node. Removes unnecessary
blank lines and makes sure that defined geometries are "closed", i.e. start coordinate equals end coordinate.

Reads OpenAIR airspace definitions:

```text
AC R
AN ED-R10B Todendorf-Putlos MON-SAT+
AH 40000ft MSL
AL GND
DP 54:25:00 N 010:40:00 E

DP 54:25:00 N 010:50:00 E
DP 54:26:00 N 010:53:00 E
DP 54:19:30 N 010:53:00 E

DP 54:15:00 N 010:41:00 E
DP 54:15:19 N 010:40:00 E
DP 54:20:00 N 010:40:00 E
```

Outputs fixed OpenAIR string:

```text
AC R
AN ED-R10B Todendorf-Putlos MON-SAT+
AH 40000ft MSL
AL GND
DP 54:25:00 N 010:40:00 E
DP 54:25:00 N 010:50:00 E
DP 54:26:00 N 010:53:00 E
DP 54:19:30 N 010:53:00 E
DP 54:15:00 N 010:41:00 E
DP 54:15:19 N 010:40:00 E
DP 54:20:00 N 010:40:00 E
DP 54:25:00 N 010:40:00 E
```

Install
=
```shell
npm install @openaip/openair-fix-syntax
```

Node
=

```javascript
const fixSyntax = require('@openaip/openair-fix-syntax');

await fixSyntax.fix({in: './path/to/input-openair-file.txt', out:'./path/to/output-openair-file.txt'});
```

CLI
=

```bash
node cli.js -h

Usage: cli [options]

Options:
  -f, --input-filepath <inFilepath>    The input file path to the openAIR file
  -o, --output-filepath <outFilepath>  The output filename of the generated fixed OpenAIR file
  -h, --help                           output usage information
```

Simple command line usage:

```bash
node cli.js -f ./path/to/input-openair-file.txt -o ./path/to/output-openair-file.txt
```
