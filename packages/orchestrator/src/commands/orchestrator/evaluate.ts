/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Orchestrator, Utility} from '@microsoft/bf-orchestrator';

export default class OrchestratorEvaluate extends Command {
  static description: string = 'Create Orchestrator leave-one-out cross validation (LOOCV) evaluation report from a .blu file previously generated.';

  static examples: Array<string> = [`
    $ bf orchestrator:evaluate 
    $ bf orchestrator:evaluate --in ./path/to/file/
    $ bf orchestrator:evaluate --in ./path/to/file/ --out ./path/to/output/`]

  static flags: flags.Input<any> = {
    in: flags.string({char: 'i', description: 'Path to source .blu file from where Orchestrator examples will be created from.'}),
    out: flags.string({char: 'o', description: 'Path to directory where analysis output files will be placed.'}),
    model: flags.string({char: 'm', description: 'Path to directory hosting Orchestrator model.'}),
    debug: flags.boolean({char: 'd'}),
    help: flags.help({char: 'h'}),
  }

  async run(): Promise<number> {
    const {flags}: flags.Output = this.parse(OrchestratorEvaluate);

    const inputPath: string = flags.in;
    const outputPath: string = flags.out;
    let nlrPath: string = flags.model;
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    }

    Utility.toPrintDebuggingLogToConsole = flags.debug;

    Utility.debuggingLog(`OrchestratorEvaluate.run(): inputPath=${inputPath}`);
    Utility.debuggingLog(`OrchestratorEvaluate.run(): outputPath=${outputPath}`);
    Utility.debuggingLog(`OrchestratorEvaluate.run(): nlrPath=${nlrPath}`);

    try {
      await Orchestrator.evaluateAsync(inputPath, outputPath, nlrPath);
    } catch (error) {
      throw (new CLIError(error));
    }
    return 0;
  }
}
