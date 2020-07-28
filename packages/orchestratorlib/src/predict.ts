/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

import * as readline from 'readline';

import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher';
import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher';

// import {ScoreStructure}  from './score-structure';

import {LabelResolver} from './labelresolver';
// import {OrchestratorHelper} from './orchestratorhelper';

import {Example} from './example';
// import {Label} from './label';
import {LabelType} from './label-type';
// import {OrchestratorHelper} from './orchestratorhelper';
// import {Result} from './result';
import {ScoreStructure} from './score-structure';
// import {Span} from './span';

import {Utility} from './utility';

/* eslint-disable no-console */
export class OrchestratorPredict {
  // eslint-disable-next-line complexity
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
    const intentLabelPrefix: string = 'Please enter an intent label (can be an index to retrieve from label-index map) > ';
    const utterancePrefix: string = 'Please enter an utterance > ';
    let command: string = '';
    let currentIntentLabels: string[] = [];
    let currentUtterance: string = '';
    let currentLabelArrayAndMap: {
      'stringArray': string[];
      'stringMap': {[id: string]: number};};
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      command = await question(commandprefix);
      command = command.trim();
      Utility.debuggingLog(`The command you entered is "${command}"`);
      if (command === 'q') {
        break;
      }
      switch (command) {
      case 'h':
        console.log('  Commands: "h", "q", "u", "cu", "i", "ci", "s", "se", "p", "v", "a", "r"');
        console.log('    h  - print help message');
        console.log('    q  - quit');
        console.log('    u  - enter an utterance');
        console.log('    cu - clear the current utterance');
        console.log('    i  - type and add an intent label');
        console.log('    ci - clear the current intent labels');
        console.log('    s  - show current utterance, intent labels, and label-index map');
        console.log('    se - show example label-utterance statistics');
        console.log('    p  - make a prediction on the current utterance');
        console.log(`    v  - execute validation and save analyses to "${predictingSetSummaryOutputFilename}"`);
        console.log('    a  - add the current utterance and intent labels to the model examples');
        console.log('    r  - remove the current utterance and intent label from the model examples');
        break;
      case 'u':
        // eslint-disable-next-line no-await-in-loop
        currentUtterance = await question(utterancePrefix);
        break;
      case 'cu':
        // eslint-disable-next-line no-await-in-loop
        currentUtterance = '';
        break;
      case 'i': {
        // eslint-disable-next-line no-await-in-loop
        let label: string = await question(intentLabelPrefix);
        label = label.trim();
        if (!Utility.isEmptyString(label)) {
          if (Number.isInteger(Number(label))) {
            const labelIndex: number = Number(label);
            const labels: string[] = labelResolver.getLabels(LabelType.Intent);
            currentLabelArrayAndMap = Utility.buildStringIdNumberValueDictionaryFromStringArray(
              labels);
            const labelArray: string[] = currentLabelArrayAndMap.stringArray;
            // eslint-disable-next-line max-depth
            if ((labelIndex < 0) || (labelIndex >= labelArray.length)) {
              console.log(`  The label index "${labelIndex}" you entered is not in range`);
              console.log(`  Current label-index map: "${Utility.jsonstringify(currentLabelArrayAndMap.stringMap)}"`);
              break;
            }
            currentIntentLabels.push(labelArray[labelIndex]);
          } else {
            currentIntentLabels.push(label);
          }
        } }
        break;
      case 'ci':
        // eslint-disable-next-line no-await-in-loop
        currentIntentLabels = [];
        break;
      case 's': {
        console.log(`  Current utterance: "${currentUtterance}"`);
        console.log(`  Current intent labels: "${currentIntentLabels}"`);
        const labels: string[] = labelResolver.getLabels(LabelType.Intent);
        currentLabelArrayAndMap = Utility.buildStringIdNumberValueDictionaryFromStringArray(
          labels);
        console.log(`  Current label-index map: "${Utility.jsonstringify(currentLabelArrayAndMap.stringMap)}"`); }
        break;
      case 'se': {
        const utterancesLabelsMap: { [id: string]: string[] } = {};
        const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
        const examples: any = labelResolver.getExamples();
        if (examples.length <= 0) {
          console.log('  There is no example');
          break;
        }
        const labels: string[] = labelResolver.getLabels(LabelType.Intent);
        currentLabelArrayAndMap = Utility.buildStringIdNumberValueDictionaryFromStringArray(
          labels);
        Utility.examplesToUtteranceLabelMaps(examples, utterancesLabelsMap, utterancesDuplicateLabelsMap);
        const labelStatisticsAndHtmlTable: {
          'labelUtterancesMap': { [id: string]: string[] };
          'labelUtterancesTotal': number;
          'labelStatistics': string[][];
          'labelStatisticsHtml': string;
        } = Utility.generateLabelStatisticsAndHtmlTable(
          utterancesLabelsMap,
          currentLabelArrayAndMap);
        const labelUtteranceCount: { [id: string]: number } = {};
        Object.entries(labelStatisticsAndHtmlTable.labelUtterancesMap).forEach(
          (x: [string, string[]]) => {
            labelUtteranceCount[x[0]] = x[1].length;
          });
        console.log(`  Per-label #examples:\n${Utility.jsonstringify(labelUtteranceCount)}`);
        console.log(`  Total #examples:${labelStatisticsAndHtmlTable.labelUtterancesTotal}`); }
        break;
      case 'p': {
        const scoreResults: any = labelResolver.score(currentUtterance, LabelType.Intent);
        if (!scoreResults) {
          continue;
        }
        console.log(`  Prediction:\n${Utility.jsonstringify(scoreResults)}`); }
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
        const evaluationOutput: {
          'evaluationReportLabelUtteranceStatistics': {
            'evaluationSummaryTemplate': string;
            'labelArrayAndMap': {
              'stringArray': string[];
              'stringMap': {[id: string]: number};};
            'labelStatisticsAndHtmlTable': {
              'labelUtterancesMap': { [id: string]: string[] };
              'labelUtterancesTotal': number;
              'labelStatistics': string[][];
              'labelStatisticsHtml': string;};
            'utteranceStatisticsAndHtmlTable': {
              'utteranceStatisticsMap': {[id: number]: number};
              'utteranceStatistics': [string, number][];
              'utteranceCount': number;
              'utteranceStatisticsHtml': string;};
            'utterancesMultiLabelArrays': [string, string][];
            'utterancesMultiLabelArraysHtml': string;
            'utterancesDuplicateLabelsHtml': string; };
          'evaluationReportAnalyses': {
            'evaluationSummaryTemplate': string;
            'ambiguousAnalysis': {
              'scoringAmbiguousOutputLines': string[][];
              'scoringAmbiguousUtterancesArraysHtml': string;};
            'misclassifiedAnalysis': {
              'scoringMisclassifiedOutputLines': string[][];
              'scoringMisclassifiedUtterancesArraysHtml': string;};
            'lowConfidenceAnalysis': {
              'scoringLowConfidenceOutputLines': string[][];
              'scoringLowConfidenceUtterancesArraysHtml': string;};
            'confusionMatrixAnalysis': {
              'confusionMatrix': MultiLabelConfusionMatrix;
              'multiLabelConfusionMatrixSubset': MultiLabelConfusionMatrixSubset;
              'scoringConfusionMatrixOutputLines': string[][];
              'confusionMatrixMetricsHtml': string;
              'confusionMatrixAverageMetricsHtml': string;}; };
          'scoreStructureArray': ScoreStructure[];
        } =
        Utility.generateEvaluationReport(
          labelResolver,
          labels,
          utterancesLabelsMap,
          utterancesDuplicateLabelsMap,
          labelsOutputFilename,
          predictingSetScoreOutputFilename,
          predictingSetSummaryOutputFilename);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`evaluationOutput=${Utility.jsonstringify(evaluationOutput)}`);
        } }
        break;
      case 'a': {
        const example: Example = Example.newIntentExample(
          currentUtterance,
          currentIntentLabels);
        const exampleObejct: any = example.toObject();
        Utility.debuggingLog(`exampleObejct=${Utility.jsonstringify(exampleObejct)}`);
        const rv: any = labelResolver.addExample(exampleObejct);
        Utility.debuggingLog(`rv=${rv}`);
        if (!rv) {
          console.log('  Example was not added!');
        } }
        break;
      case 'r': {
        const example: Example = Example.newIntentExample(
          currentUtterance,
          currentIntentLabels);
        const exampleObejct: any = example.toObject();
        Utility.debuggingLog(`exampleObejct=${Utility.jsonstringify(exampleObejct)}`);
        const rv: any = labelResolver.removeExample(exampleObejct);
        Utility.debuggingLog(`rv=${rv}`);
        if (!rv) {
          console.log('  Example was not removed!');
        } }
        break;
      default:
        console.log(`  The command you entered ${command} is not recognized!`);
        break;
      }
    }
    // eslint-disable-next-line no-console
    console.log('Bye!');
    return 0;
  }
}
