/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from "path";
import {Utility} from "./utility";
import {LabelResolver} from "./labelresolver";
import {OrchestratorHelper} from "./orchestratorhelper";

export class OrchestratorEvaluate {

  public static async runAsync(inputPath: string, outputPath: string, nlrPath: string = '') {  

    if (!inputPath || inputPath.length === 0) {
      throw new Error('Please provide path to input file/folder');
    }

    if (!outputPath || outputPath.length === 0) {
      throw new Error('Please provide output path');
    }

    var labelResolver: any = await LabelResolver.createWithSnapshotAsync(nlrPath, path.join(inputPath, 'orchestrator.blu'));
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), after calling LabelResolver.createWithSnapshotAsync}`);

    const examples = labelResolver.getExamples();
    const example = examples[0];
    const example_name = example.name;
    const labels = example.labels;
    const label = labels[0];
    const label_name = label.name;
    const label_type = label.label_type;
    const span = label.span;
    const offset = span.offset;
    const length = span.length;
    // Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(examples)=${JSON.stringify(examples)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(example)=${JSON.stringify(example)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), Object.keys(example)=${Object.keys(example)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), example_name=${example_name}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), Object.keys(labels)=${Object.keys(labels)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(label)=${JSON.stringify(label)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), Object.keys(label)=${Object.keys(label)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), label.name=${label_name}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), label.label_type=${label_type}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(span)=${JSON.stringify(span)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), Object.keys(span)=${Object.keys(span)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), label.span.offset=${offset}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), label.span.length=${length}`);
    // for (const key in examples) {
    //   Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), examples.key=${examples.key}`);
    // }

    // var snapshotJson = JSON.stringify(snapshot);
    // Utility.debuggingLog(snapshotJson);

    // OrchestratorHelper.writeToFile(path.join(outputPath, 'orchestrator_blu.json'), snapshotJson);
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
