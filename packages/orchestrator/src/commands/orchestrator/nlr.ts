/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {Utility} from '@microsoft/bf-orchestrator';

export default class OrchestratorNlr extends Command {
  static description = 'describe the command here'

  static flags: flags.Input<any> = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  async run() {
    const {flags} = this.parse(OrchestratorNlr)

    const name = flags.name ?? 'world'
    this.log(`hello ${name}`)
    
    Utility.toPrintDebuggingLogToConsole = flags.debug;

  }
}
