/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Orchestrator, Utility} from '@microsoft/bf-orchestrator';
import {OrchestratorSettings} from '../../../utils/settings';

export default class OrchestratorNlrList extends Command {
  static description: string = 'Lists all Orchestrator model versions'

  static flags: flags.Input<any> = {
    help: flags.help({char: 'h', description: 'Orchestrator nlr:list command help'}),
  }

  async run() {
    const {flags}: flags.Output = this.parse(OrchestratorNlrList)

    Utility.toPrintDebuggingLogToConsole = flags.debug;

    try {
      const json: string = await Orchestrator.nlrListAsync();
      this.log(json);
    } catch (error) {
      throw (new CLIError(error));
    }

    return 0;
  }
}
