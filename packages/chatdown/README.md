bf-chatdown
========

Tool for parsing chat files and outputting replayable activities

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/chatdown.svg)](https://npmjs.org/package/bf-chatdown)
[![Downloads/week](https://img.shields.io/npm/dw/chatdown.svg)](https://npmjs.org/package/bf-chatdown)
[![License](https://img.shields.io/npm/l/chatdown.svg)](https://github.com/Microsoft/chatdown/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ bf COMMAND
running command...
$ bf (-v|--version|version)
@microsoft/bf-chatdown/0.0.0 darwin-x64 node-v12.1.0
$ bf --help [COMMAND]
USAGE
  $ bf COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`bf chatdown`](#bf-chatdown)

## `bf chatdown`

Converts chat dialog files in <filename>.chat format into transcript file. Writes corresponding <filename>.transcript for each .chat file

```
USAGE
  $ bf chatdown

OPTIONS
  -c, --chat=chat              The path of the chat file to be parsed. If omitted, stdin will be used.

  -f, --folder=folder          Path to directory and/or all subdirectories containing chat files to be processed all at
                               once, ex. ./**/*.chat. If an output directory is not present (-o), it will default the
                               output to the current working directory.

  -h, --help                   Chatdown command help

  -o, --out_folder=out_folder  Path to the directory where the output of the multiple chat file processing (-f) will be
                               placed.

  -p, --prefix                 Prefix stdout with package name.

  -s, --static                 Use static timestamps when generating timestamps on activities.

EXAMPLE

     $ bf chatdown
     $ bf chatdown --chat=./path/to/file/sample.chat
     $ bf chatdown -f ./test/utils/*.sample.chat -o ./
     $ (echo user=Joe && [ConversationUpdate=MembersAdded=Joe]) | bf chatdown --static
```

_See code: [src/commands/chatdown.ts](https://github.com/Microsoft/chatdown/blob/v0.0.0/src/commands/chatdown.ts)_
<!-- commandsstop -->