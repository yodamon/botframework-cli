/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Orchestrator, Utility} from '@microsoft/bf-orchestrator';

export default class OrchestratorTest extends Command {
  static description: string = 'Test utterance/label samples from an input file and create an evaluation report';

  static examples: Array<string> = [`
    $ bf orchestrator:evaluate 
    $ bf orchestrator:evaluate --in ./path/to/file/
    $ bf orchestrator:evaluate --in ./path/to/file/ --out ./path/to/output/`]

  static flags: flags.Input<any> = {
    in: flags.string({char: 'i', description: 'Path to a previously created Orchestrator .blu file.'}),
    test: flags.string({char: 't', description: 'Path to a test file.'}),
    out: flags.string({char: 'o', description: 'Directory where analysis files will be placed.'}),
    model: flags.string({char: 'm', description: 'Directory or a config file hosting Orchestrator model files.'}),
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
