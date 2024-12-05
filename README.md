# OpenAIR Fix Format

A utility that fixes [OpenAIR](http://www.winpilot.com/usersguide/userairspace.asp) format for Node. This tool
supports both the **original** and the **extended** format.
Removes unnecessary blank lines,makes sure that defined geometries are "closed", i.e. start coordinate equals end coordinate and can
also set required _AI_ tag for the **extended** OpenAIR format.

Internally, the logic uses parts of our [OpenAIR Parser](https://github.com/openAIP/openaip-openair-parser) to also validate the
given OpenAIR file syntax.

**Please note that this utility will not validate/fix the given OpenAIR airspace definitions!**

If you require a robust solution that is able to validate tag values and fix geometries, please feel free to use our [OpenAIR Parser](https://github.com/openAIP/openaip-openair-parser).

### Fixes **original OpenAIR** airspace definitions:

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

### Fixes and extends to **extended OpenAIR** airspace definitions with `extendFormat: false`:

If the _AI_ token is not present, it will be injected into each airspace definition block with a random UUID v4 value.

```text
AC UNCLASSIFIED
AY R
AN ED-R10B Todendorf-Putlos MON-SAT+
AH 40000ft MSL
AL GND
AG Station Name
AF 123.456
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
AC UNCLASSIFIED
AY R
AN ED-R10B Todendorf-Putlos MON-SAT+
AI f456b6cf-177a-4947-95f6-08cc255b7e90
AG Station Name
AF 123.456
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

### Fixes and extends to **extended OpenAIR** airspace definitions with `extendFormat: false`. Re-arrange tokens with `fix-token-order: true`:

Inject the _AI_ token if no set for each airspace definition block. Additionally, re-orders token to be in the expected order.
**Note that using this feature will remove all inline comments from the file!**

```text
AC UNCLASSIFIED
AY R
AN ED-R10B Todendorf-Putlos MON-SAT+
AL GND
AH 40000ft MSL
AG Station Name
AF 123.456
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
AC UNCLASSIFIED
AY R
AN ED-R10B Todendorf-Putlos MON-SAT+
AI f456b6cf-177a-4947-95f6-08cc255b7e90
AF 123.456
AG Station Name
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

# Extended OpenAIR Format

The **original** OpenAIR format specification has multiple shortcomings to meet today's demand to reflect the various types of existing airspaces
and provide additional metadata. To overcome these shortcomings, an **extended** OpenAIR format is introduced that has several new tags.

### Extended Format Tags:

#### AI

A required unique identifier string for each airspace, e.g. a [UUID v4](https://en.wikipedia.org/wiki/Universally_unique_identifier). The _AI_ value must stay the same for each airspace throughout different versions if the file. The _AI_ tag must be placed either before or directly after the _AN_ tag. Placing the _AI_ tag before the _AN_ tag is preferred

#### AY

The optional _AY_ tag specifies the airspace type, e.g. "TMA", "CTR" or "TMZ". Unlike in the original format, the _AC_ tag must now only be used to specify the airspace _ICAO class_. If airspace has no type, i.e. is only ICAO class, the _AY_ tag can be omitted. The _AY_ tag must be placed directly after the _AC_ tag.

#### AF

An optional tag that specifies the frequency of a ground station that provides information on the defined airspace. The _AF_ must be placed directly after either the _AI_ tag or the _AG_ tag. If placed after the _AG_ tag, the _AG_ tag must directly be placed after the _AI_ tag. The proposed best order is _AF_, then _AG_.

#### AG

If _AF_ is present, defines the ground station name. May not be used without the _AF_ tag. The _AG_ must be placed directly after either the _AF_ tag or the _AF_ tag. If placed after the _AG_ tag, the _AF_ tag must directly be placed after the _AI_ tag. The proposed best order is _AF_, then _AG_.

# Install

```shell
npm install -g @openaip/openair-fix-format
```

# Node

```javascript
const fixFormat = require('@openaip/openair-fix-format');

await fixFormat.fix({ in: './path/to/input-openair-file.txt', out: './path/to/output-openair-file.txt' });
```

# CLI

```bash
node cli.js -h

Usage: cli [options]

Options:
  -f, --input-filepath <inFilepath>    The input file path to the openAIR file.
  -o, --output-filepath <outFilepath>  The output filename of the generated fixed OpenAIR file.
  -E, --extend-format                  If true, an additional "AI" token with a unique identifier is injected into each airspace block so that the file is compatible with the extended OpenAIR format. Defaults to "false".
  -O  --fix-token-order                If true, will re-order found tokens and put them into the expected order. Note that this will remove all inline comments from the airspace definition blocks! Defaults to "false".
  -h, --help                           Outputs usage information.
```

Simple command line usage:

```bash
node cli.js -f ./path/to/input-openair-file.txt -o ./path/to/output-openair-file.txt
```
