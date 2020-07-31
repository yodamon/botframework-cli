/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Orchestrator, Utility} from '@microsoft/bf-orchestrator';

export default class OrchestratorEvaluate extends Command {
  static description: string = 'Create an Orchestrator leave-one-out cross validation (LOOCV) evaluation report on a previously generated .blu file .';

  static examples: Array<string> = [`
    $ bf orchestrator:evaluate 
    $ bf orchestrator:evaluate --in ./path/to/file/
    $ bf orchestrator:evaluate --in ./path/to/file/ --out ./path/to/output/`]

  static flags: flags.Input<any> = {
    in: flags.string({char: 'i', description: 'Path to a previously created Orchestrator .blu file.'}),
    out: flags.string({char: 'o', description: 'Directory where analysis files will be placed.'}),
    model: flags.string({char: 'm', description: 'Directory or a config file hosting Orchestrator model files. Optional.'}),
    ambiguous: flags.string({char: 'a', description: 'Ambiguous threshold, default to 0.2'}),
    low_confidence: flags.string({char: 'l', description: 'Low confidence threshold, default to 0.5'}),
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

    let ambiguousClosenessParameter: number = 0.2;
    let lowConfidenceScoreThresholdParameter: number = 0.5;
    if (flags.ambiguous) {
      ambiguousClosenessParameter = Number(flags.ambiguous);
      if (Number.isNaN(ambiguousClosenessParameter)) {
        Utility.writeLineToConsole(`ambiguous parameter "${flags.ambiguous}" is not a number`);
      }
    }
    if (flags.low_confidence) {
      lowConfidenceScoreThresholdParameter = Number(flags.low_confidence);
      if (Number.isNaN(lowConfidenceScoreThresholdParameter)) {
        Utility.writeLineToConsole(`low_confidence parameter "${flags.ambiguous}" is not a number`);
      }
    }

    Utility.toPrintDebuggingLogToConsole = flags.debug;

    Utility.debuggingLog(`OrchestratorEvaluate.run(): inputPath=${inputPath}`);
    Utility.debuggingLog(`OrchestratorEvaluate.run(): outputPath=${outputPath}`);
    Utility.debuggingLog(`OrchestratorEvaluate.run(): nlrPath=${nlrPath}`);
    Utility.debuggingLog(`OrchestratorEvaluate.run(): ambiguousClosenessParameter=${ambiguousClosenessParameter}`);
    Utility.debuggingLog(`OrchestratorEvaluate.run(): lowConfidenceScoreThresholdParameter=${lowConfidenceScoreThresholdParameter}`);

    try {
      await Orchestrator.evaluateAsync(
        inputPath, outputPath, nlrPath,
        ambiguousClosenessParameter,
        lowConfidenceScoreThresholdParameter);
    } catch (error) {
      throw (new CLIError(error));
    }
    return 0;
  }
}
