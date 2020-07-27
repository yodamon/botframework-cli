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
    in: flags.string({char: 'i', description: 'The path to source .blu file from where orchestrator examples will be loaded from.'}),
    test: flags.string({char: 't', description: 'The path to test label file from where orchestrator examples will be created from.'}),
    out: flags.string({char: 'o', description: 'Path to directory where analysis output files will be placed.'}),
    model: flags.string({char: 'm', description: 'Path to directory hosting Orchestrator model.'}),
    debug: flags.boolean({char: 'd'}),
    help: flags.help({char: 'h'}),
  }

  async run(): Promise<number> {
    const {flags}: flags.Output = this.parse(OrchestratorTest);

    const inputPath: string = flags.in;
    const testPath: string = flags.test;
    const outputPath: string = flags.out;
    let nlrPath: string = flags.model;
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    }

    Utility.toPrintDebuggingLogToConsole = flags.debug;

    Utility.debuggingLog(`OrchestratorTest.run(): inputPath=${inputPath}`);
    Utility.debuggingLog(`OrchestratorTest.run(): testPath=${testPath}`);
    Utility.debuggingLog(`OrchestratorTest.run(): outputPath=${outputPath}`);
    Utility.debuggingLog(`OrchestratorTest.run(): nlrPath=${nlrPath}`);

    try {
      await Orchestrator.testAsync(nlrPath, inputPath, testPath, outputPath);
    } catch (error) {
      throw (new CLIError(error));
    }
    return 0;
  }
}
