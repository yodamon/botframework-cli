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
    LabelResolver.addExamples((await OrchestratorHelper.getUtteranceLabelsMap(inputPath, hierarchical)).utteranceLabelsMap);

    const snapshot: any = labelResolver.createSnapshot();

    let outPath = OrchestratorCreate.getOutputPath(outputPath, inputPath)
    OrchestratorHelper.writeToFile(outPath, snapshot);
    Utility.debuggingLog(`Snapshot written to ${outputPath}`);
  }

  private static getOutputPath(out: string, base: string)
  {
    let retValue = out;
    if (!out.endsWith(`.blu`)) {
      const srcBaseFileName = path.basename(base);
      const dstBaseFileName = srcBaseFileName.substring(0, srcBaseFileName.lastIndexOf('.'));
      retValue = path.join(out, `${dstBaseFileName}.blu`);
    }
    return retValue;
  }
}
