/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Command, CLIError, flags} from '@microsoft/bf-cli-command';
import {LabelResolver, Utility, Orchestrator} from '@microsoft/bf-orchestrator';
import {OrchestratorHelper} from '../../utils';

const LuisBuilder: any = require('@microsoft/bf-lu').V2.LuisBuilder;

export default class OrchestratorBuild extends Command {
  static description = 'describe the command here'

  static flags: flags.Input<any> = {
    in: flags.string({char: 'i', description: 'Path to source label files.'}),
    model: flags.string({char: 'm', description: 'Path to Orchestrator model.'}),
    out: flags.string({char: 'o', description: 'Path where generated orchestrator example file will be placed. Default to current working directory.'}),
    force: flags.boolean({char: 'f', description: 'If --out flag is provided with the path to an existing file, overwrites that file.', default: false}),
    debug: flags.boolean({char: 'd'}),
    help: flags.help({char: 'h', description: 'Orchestrator add command help'}),
  }

  static args = [{name: 'file'}];

  async run() {
    const {args, flags} = this.parse(OrchestratorBuild)

    const name = flags.name ?? 'world'
    this.log(`hello ${name} from D:\\src\\botframework-cli\\packages\\orchestrator\\src\\commands\\build.ts`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
    
    let nlrPath = flags.model;
    if (!nlrPath || nlrPath.length == 0) {
      nlrPath = 'D:\\src\\TScience\\Orchestrator\\oc\\dep\\model';
    }

    Utility.toPrintDebuggingLogToConsole = flags.debug;

    const labelResolver =await LabelResolver.createAsync(nlrPath, false);
    this.log('Use compact embedding == false!');
    const example = { 
        label: 'travel', 
        text: 'book a flight to miami.',
        };
    
    if (labelResolver.addExample(example) == true)
    {
      this.log('Added example!');
    }

    const example2 = { 
      label: 'schedule', 
      text: 'when is my next appointment?',
      };
    let val = labelResolver.addExample(example2);
    if (val == true)
    {
        this.log('Added example2!');
    }
    const example3 = { 
        label: 'greeting', 
        text: 'hello there!',
        };
    val = labelResolver.addExample(example3);
    if (val == true)
    {
      this.log('Added example3!');
    }


    var results = labelResolver.score("hey");
    Utility.writeToConsole(JSON.stringify(results));
    var snapshot = labelResolver.createSnapshot();

    this.log('Created snapshot!');

    this.log('Saving snapshot');
    OrchestratorHelper.writeToFile('D:\\src\\snapshot.blu', snapshot);

    const snapshotFromFile = OrchestratorHelper.readFile('D:\\src\\snapshot.blu');
    const encoder = new TextEncoder();
    const uint8array = encoder.encode(snapshotFromFile);
    
    this.log('Going to create labeler #2');
    let labeler2 = LabelResolver.Orchestrator.createLabelResolver(snapshot); 
    this.log('Created Labeler #2.');

    this.log('Going to create labeler #3');
    let labeler3 = LabelResolver.Orchestrator.createLabelResolver(uint8array); 
    this.log('Created Labeler #3.');


    //
    // Get Examples
    //
    console.log('Getting examples')
    let examples = labeler2.getExamples();
    this.log("EXAMPLES " + JSON.stringify(examples));


     //
    // Get Examples
    //
    console.log('Getting examples 3')
    let examples3 = labeler3.getExamples();
    this.log("EXAMPLES " + JSON.stringify(examples3));
    
    // 
    // Remove Example
    //
    labeler2.removeExample(example3);
    examples = labeler2.getExamples();
    
    //
    // Get Labels
    //
    var labels = labeler2.getLabels();

  }
}
