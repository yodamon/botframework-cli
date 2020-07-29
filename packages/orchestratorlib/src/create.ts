/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Utility} from './utility';
import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';
import { existsSync } from 'fs';

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
    LabelResolver.addExamples((await OrchestratorHelper.getUtteranceLabelsMap(inputPath, hierarchical)).utterancesLabelsMap);

    const snapshot: any = labelResolver.createSnapshot();

    let outPath = OrchestratorCreate.getOutputPath(outputPath, inputPath)
    OrchestratorHelper.writeToFile(outPath, snapshot);
    Utility.debuggingLog(`Snapshot written to ${outputPath}`);
  }

  private static getOutputPath(out: string, base: string)
  {
    console.log(`Processing ${out} and ${base}`);
    let retValue = out;
    if (existsSync(out)) {
      console.log(`${out} exists...`)
      // if (lstatSync(out).isDirectory()) {
      //   console.log(`${out} isDirectory()...`)
      //   // need to append file name
      //   if (lstatSync(base).isDirectory()) {
      //     console.log(`${base} isDirectory()...`)
      //     retValue = path.join(out, `orchestrator.blu`);
      //   } else {
      //     console.log(`${base} is file name...`)
      //     const srcBaseFileName = path.basename(base);
      //     const dstBaseFileName = srcBaseFileName.substring(0, srcBaseFileName.lastIndexOf('.'));
      //     retValue = path.join(out, dstBaseFileName, '.blu');
      //   }
      // } 
    }
    console.log(`returning ${retValue}....`);
    return retValue;
  }
}
