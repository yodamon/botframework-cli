/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Orchestrator, Utility} from '@microsoft/bf-orchestrator';

export default class OrchestratorPredict extends Command {
  static description: string = 'Returns score of given utterance using previously created orchestrator examples';

  static examples: Array<string> = [`
    $ bf orchestrator:predict 
    $ bf orchestrator:predict --label ./path/to/file/
    $ bf orchestrator:predict --label ./path/to/file/ --out ./path/to/output/`]

  static flags: flags.Input<any> = {
    label: flags.string({char: 'l', description: 'The path to label file from where orchestrator examples will be created from.'}),
    out: flags.string({char: 'o', description: 'Path to directory where analysis output files will be placed.'}),
    model: flags.string({char: 'm', description: 'Path to directory hosting Orchestrator model.'}),
    debug: flags.boolean({char: 'd'}),
    help: flags.help({char: 'h'}),
  }

  async run(): Promise<number> {
    const {flags}: flags.Output = this.parse(OrchestratorPredict);

    const labelPath: string = flags.label;
    const outputPath: string = flags.out;
    let nlrPath: string = flags.model;
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    }

    Utility.toPrintDebuggingLogToConsole = flags.debug;

    Utility.debuggingLog(`OrchestratorPredict.run(): labelPath=${labelPath}`);
    Utility.debuggingLog(`OrchestratorPredict.run(): outputPath=${outputPath}`);
    Utility.debuggingLog(`OrchestratorPredict.run(): nlrPath=${nlrPath}`);

    try {
      await Orchestrator.predictAsync(nlrPath, labelPath, outputPath);
    } catch (error) {
      throw (new CLIError(error));
    }
    return 0;
  }
}
