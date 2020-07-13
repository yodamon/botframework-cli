/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from "path";
import {Utility} from "./utility";
import {LabelResolver} from "./labelresolver";
import {OrchestratorHelper} from "./orchestratorhelper";

export class OrchestratorEvaluate {

  public static async runAsync(nlrPath: string, inputPath: string, outputPath: string, isDebug: boolean = false) {  
    if (!nlrPath || nlrPath.length === 0) {
      throw new Error('Please provide path to Orchestrator model');
    }

    if (!inputPath || inputPath.length === 0) {
      throw new Error('Please provide path to input file/folder');
    }

    if (!outputPath || outputPath.length === 0) {
      throw new Error('Please provide output path');
    }

    Utility.toPrintDebuggingLogToConsole = isDebug;

    nlrPath = path.resolve(nlrPath);

    var labelResolver = await LabelResolver.createAsync(nlrPath);
    var utterancesLabelsMap = await OrchestratorHelper.getUtteranceLabelsMap(inputPath);
    
    // eslint-disable-next-line guard-for-in
    for (const utterance in utterancesLabelsMap) {
      const labels: any = utterancesLabelsMap[utterance];
      for (const label of labels) {
        var success = labelResolver.addExample({ label: label, text: utterance});
        if (success) {
          Utility.debuggingLog(`Added { label: ${label}, text: ${utterance}}`);
        }
      }
    }

    var snapshot = labelResolver.createSnapshot();
    var snapshotJson = JSON.stringify(snapshot);
    Utility.debuggingLog(snapshot);

    OrchestratorHelper.writeToFile(outputPath, snapshot);
  }

  // protected debug: boolean = false;
  // protected labelResolver: any = null;
  //
  // public constructor(debug: boolean = false) {
  //   this.debug = debug;
  // }
  //
  // public async loadLabelResolverAsync(nlrPath: string) {
  //   try {
  //     if (nlrPath) {
  //       nlrPath = path.resolve(nlrPath);
  //     }
  //     if (nlrPath.length === 0) {
  //       throw new Error("Please provide path to Orchestrator model");
  //     }
  //     this.labelResolver = await LabelResolver.createAsync(nlrPath);
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // }

  // public async readSnapshotContent(inputPath: string, outputPath: string): Promise<string> {
  //   string snapshotContent:  = await OrchestratorHelper.readFile(inputPath);
  //   return snapshotContent;
  // }
}
