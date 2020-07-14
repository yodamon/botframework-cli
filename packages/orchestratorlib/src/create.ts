/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Utility} from './utility';
import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

export class OrchestratorCreate {
  public static async runAsync(nlrPath: string, inputPath: string, outputPath: string, hierarchical: boolean = false) {
    if (!nlrPath || nlrPath.length === 0) {
      throw new Error('Please provide path to Orchestrator model');
    }

    if (!inputPath || inputPath.length === 0) {
      throw new Error('Please provide path to input file/folder');
    }

    if (!outputPath || outputPath.length === 0) {
      throw new Error('Please provide output path');
    }

    nlrPath = path.resolve(nlrPath);

    const labelResolver: any = await LabelResolver.createAsync(nlrPath);
    LabelResolver.addExamples(await OrchestratorHelper.getUtteranceLabelsMap(inputPath, hierarchical));

    const snapshot: any = labelResolver.createSnapshot();
    OrchestratorHelper.writeToFile(outputPath, snapshot);

    /*
    const labelResolver2: any = await LabelResolver.Orchestrator.createLabelResolver(snapshot);
    
    if (labelResolver2) {
      Utility.debuggingLog('Created labelResolver2');
    }
    */
    Utility.debuggingLog(`Snapshot written to ${outputPath}`);
  }
}
