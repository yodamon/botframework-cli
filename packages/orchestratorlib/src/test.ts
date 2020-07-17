/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Utility} from './utility';
import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

export class OrchestratorTest {
  public static async runAsync(nlrPath: string, inputPath: string, testPath: string, outputPath: string) {
    if (!inputPath || inputPath.length === 0) {
      throw new Error('Please provide path to input file/folder');
    }
    if (!testPath || testPath.length === 0) {
      throw new Error('Please provide test path');
    }
    nlrPath = path.resolve(nlrPath);
    const trainingFile: string = path.join(inputPath, 'orchestrator.blu');

    const labelResolver: any = await LabelResolver.createWithSnapshotAsync(nlrPath, trainingFile);
    Utility.debuggingLog('OrchestratorTest.runAsync(), after calling LabelResolver.createWithSnapshotAsync()');

    const trainingSetUtterancesLabelsMap: { [id: string]: string[] } = {};
    const trainingSetUtterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    await OrchestratorHelper.processFile(trainingFile, path.basename(trainingFile), trainingSetUtterancesLabelsMap, trainingSetUtterancesDuplicateLabelsMap, false);
    const trainingSetLabels: string[] =
      [...Object.values(trainingSetUtterancesLabelsMap)].reduce(
        (accumulant: string[], entry: string[]) => accumulant.concat(entry), []);
    const labelArrayAndMap: {
      'stringArray': string[];
      'stringMap': {[id: string]: number};} = Utility.buildStringIdNumberValueDictionaryFromStringArray(
        trainingSetLabels);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(labelArrayAndMap.stringArray)}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(labelArrayAndMap.stringMap)}`);

    const utterancesLabelsMap: { [id: string]: string[] } = {};
    const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    await OrchestratorHelper.processFile(testPath, path.basename(testPath), utterancesLabelsMap, utterancesDuplicateLabelsMap, false);

    Utility.debuggingLog('OrchestratorTest.runAsync(), after calling OrchestratorHelper.processFile()');
    // Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(utterancesLabelsMap)=${JSON.stringify(utterancesLabelsMap)}`);
    // ---- Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utterancesDuplicateLabelsMap))=${JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utterancesDuplicateLabelsMap))}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of unique utterances=${Object.keys(utterancesLabelsMap).length}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of duplicate utterance/label pairs=${utterancesDuplicateLabelsMap.size}`);
    // for (const utterance in utterancesLabelsMap) {
    //   if (utterance) {
    //     const results: any = labelResolver.score(utterance);
    //     // Utility.debuggingLog(`OrchestratorTest.runAsync(), results=${JSON.stringify(results)}`);
    //     for (const result of results) {
    //       if (result) {
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), result=${JSON.stringify(result)}`);
    //         const closest_text: string = result.closest_text;
    //         const score: string = result.score;
    //         const label: any = result.label;
    //         const label_name: string = label.name;
    //         const label_type: any = label.label_type;
    //         const span: any = label.span;
    //         const offset: number = span.offset;
    //         const length: number = span.length;
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), closest_text=${closest_text}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), score=${score}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(label)=${JSON.stringify(label)}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), Object.keys(label)=${Object.keys(label)}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), label.name=${label_name}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), label.label_type=${label_type}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(span)=${JSON.stringify(span)}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), Object.keys(span)=${Object.keys(span)}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), label.span.offset=${offset}`);
    //         Utility.debuggingLog(`OrchestratorTest.runAsync(), label.span.length=${length}`);
    //       }
    //     }
    //     // const labelsPerUtterance: Array<string> = utterancesLabelsMap[utterance];
    //     // if (labelsPerUtterance.length > 1) {
    //     //   Utility.debuggingLog(`OrchestratorTest.runAsync(), utterance "${utterance}" has more than 1 labels: ${labelsPerUtterance}`);
    //     // }
    //   }
    // }
    const labels: any = labelResolver.getLabels();
    Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
  }
}
