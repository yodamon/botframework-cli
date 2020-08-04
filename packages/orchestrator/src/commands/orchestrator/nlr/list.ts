/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Orchestrator, Utility} from '@microsoft2/bf-orchestrator';
import {OrchestratorSettings} from '../../../utils/settings';

export default class OrchestratorNlrList extends Command {
  static description: string = 'Lists all Orchestrator model versions'

  static flags: flags.Input<any> = {
    help: flags.help({char: 'h', description: 'Orchestrator nlr:list command help'}),
    raw: flags.boolean({char: 'r', description: 'Raw output', default: false}),
  }

  async run() {
    const {flags}: flags.Output = this.parse(OrchestratorNlrList)

    Utility.toPrintDebuggingLogToConsole = flags.debug;

    try {
      const json: string = await Orchestrator.nlrListAsync();
      if (!flags.raw) {
        const nlrList = JSON.parse(json);
        let output = `\n\nAvailable models:\n\n`;
        Object.getOwnPropertyNames(nlrList.models).forEach(key => {
          output += `\n${key}\n`;
          output += `\t Version Id:   ${key}\n`;
          output += `\t Release date: ${nlrList.models[key].releaseDate}\n`;
          output += `\t Description:  ${nlrList.models[key].description}\n`;
        })
        this.log(output);
      } else {
        this.log(json);
      }
      
    } catch (error) {
      throw (new CLIError(error));
    }

    return 0;
  }
}
