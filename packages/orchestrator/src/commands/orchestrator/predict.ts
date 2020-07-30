/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Orchestrator, Utility} from '@microsoft/bf-orchestrator';

export default class OrchestratorPredict extends Command {
  static description: string = 'Real-time interaction with Orchestrator model and analysis. Can return score of given utterance using previously created orchestrator examples';

  static examples: Array<string> = [`
    $ bf orchestrator:predict 
    $ bf orchestrator:predict --in ./path/to/file/
    $ bf orchestrator:predict --in ./path/to/file/ --out ./path/to/output/`]

  static flags: flags.Input<any> = {
    in: flags.string({char: 'l', description: 'Path to a previously created Orchestrator .blu file. Optional.'}),
    out: flags.string({char: 'o', description: 'Directory where analysis files will be placed.'}),
    model: flags.string({char: 'm', description: 'Directory or a config file hosting Orchestrator model files.'}),
    debug: flags.boolean({char: 'd'}),
    help: flags.help({char: 'h'}),
  }

  async run(): Promise<number> {
    const {flags}: flags.Output = this.parse(OrchestratorPredict);

    const inputPath: string = flags.in;
    const outputPath: string = flags.out;
    let nlrPath: string = flags.model;
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    }

    Utility.toPrintDebuggingLogToConsole = flags.debug;

    Utility.debuggingLog(`OrchestratorPredict.run(): inputPath=${inputPath}`);
    Utility.debuggingLog(`OrchestratorPredict.run(): outputPath=${outputPath}`);
    Utility.debuggingLog(`OrchestratorPredict.run(): nlrPath=${nlrPath}`);

    try {
      await Orchestrator.predictAsync(nlrPath, inputPath, outputPath);
    } catch (error) {
      throw (new CLIError(error));
    }
    return 0;
  }
}
