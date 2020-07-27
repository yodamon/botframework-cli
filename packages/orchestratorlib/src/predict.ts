/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

import * as readline from 'readline';

// import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher';
// import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher';

// import {ScoreStructure}  from './score-structure';

import {LabelResolver} from './labelresolver';
// import {OrchestratorHelper} from './orchestratorhelper';

// import {Example} from './example';
// import {Label} from './label';
import {LabelType} from './label-type';
// import {OrchestratorHelper} from './orchestratorhelper';
// import {Result} from './result';
// import {ScoreStructure} from './score-structure';
// import {Span} from './span';

import {Utility} from './utility';

/* eslint-disable no-console */
export class OrchestratorPredict {
  public static async runAsync(nlrPath: string, labelPath: string, outputPath: string): Promise<number> {
    // ---- NOTE ---- process arguments
    if (Utility.isEmptyString(labelPath)) {
      Utility.debuggingThrow('Please provide path to label file/folder');
    }
    if (Utility.isEmptyString(outputPath)) {
      Utility.debuggingThrow('Please provide an output directory');
    }
    if (Utility.isEmptyString(nlrPath)) {
      Utility.debuggingThrow('The nlrPath argument is empty');
    }
    nlrPath = path.resolve(nlrPath);

    // ---- NOTE ---- load the training set
    const trainingFile: string = path.join(labelPath, 'orchestrator.blu');
    // if (!Utility.exists(trainingFile)) {
    //   Utility.debuggingThrow(`training set file does not exist, trainingFile=${trainingFile}`);
    // }
    const predictingSetScoreOutputFilename: string = path.join(outputPath, 'orchestrator_predicting_set_scores.txt');
    const predictingSetSummaryOutputFilename: string = path.join(outputPath, 'orchestrator_predicting_set_summary.html');
    const labelsOutputFilename: string = path.join(outputPath, 'orchestrator_labels.txt');

    // ---- NOTE ---- create a LabelResolver object.
    Utility.debuggingLog('OrchestratorPredict.runAsync(), ready to call LabelResolver.createWithSnapshotAsync()');
    let labelResolver: any;
    if (Utility.exists(trainingFile)) {
      labelResolver = await LabelResolver.createWithSnapshotAsync(nlrPath, trainingFile);
    } else {
      labelResolver = await LabelResolver.createAsync(nlrPath);
    }
    Utility.debuggingLog('OrchestratorPredict.runAsync(), after calling LabelResolver.createWithSnapshotAsync()');

    // ---- NOTE ---- prepare readline
    const interactive: readline.Interface = readline.createInterface(process.stdin, process.stdout);
    const question: any = function (prefix: string) {
      return new Promise((resolve: any, _reject: any) => {
        interactive.question(prefix, (answer: string) => {
          resolve(answer);
        });
      });
    };
    const commandprefix: string = 'Please enter a command, "h" for help > ';
    const intentLabelPrefix: string = 'Please enter an intent label > ';
    const utterancePrefix: string = 'Please enter an utterance > ';
    let command: string = '';
    let currentIntentLabel: string = '';
    let currentUtterance: string = '';
    let currentLabelArrayAndMap: {
      'stringArray': string[];
      'stringMap': {[id: string]: number};};
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      command = await question(commandprefix);
      Utility.debuggingLog(`The command you entered "${command}"`);
      if (command === 'q') {
        break;
      }
      switch (command) {
      case 'h':
        console.log('  Commands: "h", "q", "u", "i", "s", "p", "v", "a", "r"');
        console.log('    h - print help message');
        console.log('    q - quit');
        console.log('    u - enter an utterance for analysis');
        console.log('    i - enter an intent label for analysis');
        console.log('    s - show current utterance, intent label, and label-index map');
        console.log('    p - make a prediction on the current utterance label');
        console.log(`    v - execute validation and save analyses to ${predictingSetSummaryOutputFilename}`);
        console.log('    a - add the current utterance and intent label to the model examples');
        console.log('    r - remove the current utterance and intent label from the model examples');
        break;
      case 'u':
        // eslint-disable-next-line no-await-in-loop
        currentUtterance = await question(utterancePrefix);
        break;
      case 'i':
        // eslint-disable-next-line no-await-in-loop
        currentIntentLabel = await question(intentLabelPrefix);
        break;
      case 's': {
        console.log(`  Current utterance: "${currentUtterance}"`);
        console.log(`  Current intent label: "${currentIntentLabel}"`);
        const labels: string[] = labelResolver.getLabels(LabelType.Intent);
        currentLabelArrayAndMap = Utility.buildStringIdNumberValueDictionaryFromStringArray(
          labels);
        console.log(`  Current label-index map: "${Utility.jsonstringify(currentLabelArrayAndMap.stringMap)}"`); }
        break;
      case 'p': {
        const scoreResults: any = labelResolver.score(currentUtterance, LabelType.Intent);
        if (!scoreResults) {
          continue;
        }
        console.log(`prediction=\n${Utility.jsonstringify(scoreResults)}`); }
        break;
      case 'v': {
        const labels: string[] = labelResolver.getLabels(LabelType.Intent);
        const utterancesLabelsMap: { [id: string]: string[] } = {};
        const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
        const examples: any = labelResolver.getExamples();
        if (examples.length <= 0) {
          console.log('there is no example in the training set, please add some.');
          break;
        }
        Utility.examplesToUtteranceLabelMaps(examples, utterancesLabelsMap, utterancesDuplicateLabelsMap);
        // ---- NOTE ---- integrated step to produce analysis reports.
        // const evaluationOutput: {
        //   'evaluationReportLabelUtteranceStatistics': {
        //     'evaluationSummaryTemplate': string;
        //     'labelArrayAndMap': {
        //       'stringArray': string[];
        //       'stringMap': {[id: string]: number};};
        //     'labelStatisticsAndHtmlTable': {
        //       'labelStatistics': string[][];
        //       'labelStatisticsHtml': string;};
        //     'utteranceStatisticsAndHtmlTable': {
        //       'utteranceStatistics': [string, number][];
        //       'utteranceStatisticsHtml': string;};
        //     'utterancesMultiLabelArrays': [string, string][];
        //     'utterancesMultiLabelArraysHtml': string;
        //     'utterancesDuplicateLabelsHtml': string; };
        //   'evaluationReportAnalyses': {
        //     'evaluationSummaryTemplate': string;
        //     'ambiguousAnalysis': {
        //       'scoringAmbiguousOutputLines': string[][];
        //       'scoringAmbiguousUtterancesArraysHtml': string;};
        //     'misclassifiedAnalysis': {
        //       'scoringMisclassifiedOutputLines': string[][];
        //       'scoringMisclassifiedUtterancesArraysHtml': string;};
        //     'lowConfidenceAnalysis': {
        //       'scoringLowConfidenceOutputLines': string[][];
        //       'scoringLowConfidenceUtterancesArraysHtml': string;};
        //     'confusionMatrixAnalysis': {
        //       'confusionMatrix': MultiLabelConfusionMatrix;
        //       'multiLabelConfusionMatrixSubset': MultiLabelConfusionMatrixSubset;
        //       'scoringConfusionMatrixOutputLines': string[][];
        //       'confusionMatrixMetricsHtml': string;
        //       'confusionMatrixAverageMetricsHtml': string;}; };
        // } =
        Utility.generateEvaluationReport(
          labelResolver,
          labels,
          utterancesLabelsMap,
          utterancesDuplicateLabelsMap,
          labelsOutputFilename,
          predictingSetScoreOutputFilename,
          predictingSetSummaryOutputFilename); }
        break;
      default:
        break;
      }
    }
    // eslint-disable-next-line no-console
    console.log('Bye!');
    return 0;
  }
}
