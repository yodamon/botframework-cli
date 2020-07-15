/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Orchestrator, Utility} from '@microsoft/bf-orchestrator';

export default class OrchestratorTest extends Command {
  static description: string = 'Run orchestrator test evaluation using given test file';

  static examples: Array<string> = [`
    $ bf orchestrator:evaluate 
    $ bf orchestrator:evaluate --in ./path/to/file/
    $ bf orchestrator:evaluate --in ./path/to/file/ --out ./path/to/output/`]

  static flags: flags.Input<any> = {
    in: flags.string({char: 'i', description: 'The path to source .blu file from where orchestrator example file will be created from. Default to current working directory.'}),
    test: flags.string({char: 't', description: 'The path to test label file from where orchestrator example file will be created from.'}),
    out: flags.string({char: 'o', description: 'Path where generated orchestrator example file will be placed. Default to current working directory.'}),
    model: flags.string({char: 'm', description: 'Path to Orchestrator model.'}),
    debug: flags.boolean({char: 'd'}),
    help: flags.help({char: 'h'}),
  }

  async run(): Promise<number> {
    const {flags}: flags.Output = this.parse(OrchestratorTest);

    const input: string = flags.in;
    const test: string = flags.test;
    const output: string = flags.out || __dirname;
    let nlrPath: string = flags.model;
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    }
  
    Utility.toPrintDebuggingLogToConsole = flags.debug;

    Utility.debuggingLog(`OrchestratorEvaluate.run(): input=${input}`);
    Utility.debuggingLog(`OrchestratorEvaluate.run(): output=${output}`);
    Utility.debuggingLog(`OrchestratorEvaluate.run(): nlrPath=${nlrPath}`);

    try {
      await Orchestrator.testAsync(nlrPath, input, output);
    } catch (error) {
      throw (new CLIError(error));
    }

    /*
    let args: string = `test --in ${input} --test ${test} --out ${output}`;
    if (flags.debug) {
      args += ' --debug';
    }
    if (nlrPath) {
      args += ` --model ${nlrPath}`;
    }

    if (flags.debug) {
      const loggingMessage: string = `test.ts: arguments = ${args}`;
      const loggingMessageCodified: string = Utility.debuggingLog(loggingMessage);
      this.log(loggingMessageCodified);
    }

    // TO-DO: figure out rush package dependency with regard to oclif folder structure
    // require("dotnet-3.1") statement works only for local package install
    // process.argv= [process.argv[0], process.argv[1], __dirname + '/netcoreapp3.1/OrchestratorCli.dll', ...process.argv.slice(2)]
    // require("dotnet-3.1")

    try {
      const command: string = 'dotnet "' + path.join(...[__dirname, 'netcoreapp3.1', 'OrchestratorCli.dll']) + '" ' + args;
      if (flags.debug) {
        const loggingMessage: string = `test.ts: command = ${command}`;
        const loggingMessageCodified: string = Utility.debuggingLog(loggingMessage);
        this.log(loggingMessageCodified);
      }
      require('child_process').execSync(command, {stdio: [0, 1, 2]});
    } catch (error) {
      return 1;
    }
    */
    return 0;
  }
}
