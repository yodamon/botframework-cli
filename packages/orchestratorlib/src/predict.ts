/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

import * as readline from 'readline';

import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher';
import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher';

import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

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
    const trainingFileOutput: string = path.join(outputPath, 'orchestrator.blu');

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
    const commandprefix: string =
      'Please enter a commandlet, "h" for help > ';
    const questionForUtterance: string =
      'Please enter an utterance > ';
    const questionForCurrentIntentLabel: string =
      'Please enter a "current" intent label > ';
    const questionForNewIntentLabel: string =
      'Please enter a "new" intent label > ';
    const questionForUtteranceLabelsFromDuplicates: string =
      'Please enter an index from the Duplicates report > ';
    const questionForUtteranceLabelsFromAmbiguous: string =
      'Please enter an index from the Ambiguous report > ';
    const questionForUtteranceLabelsFromMisclassified: string =
      'Please enter an index from the Misclassified report > ';
    const questionForUtteranceLabelsFromLowConfidence: string =
      'Please enter an index from the LowConfidence report > ';
    let command: string = '';
    let currentUtterance: string = '';
    let currentIntentLabels: string[] = [];
    let newIntentLabels: string[] = [];
    let currentLabelArrayAndMap: {
      'stringArray': string[];
      'stringMap': {[id: string]: number};};
    let evaluationOutput: {
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
        'utteranceLabelDuplicateHtml': string; };
      'evaluationReportAnalyses': {
        'evaluationSummaryTemplate': string;
        'ambiguousAnalysis': {
          'scoringAmbiguousUtterancesArrays': string[][];
          'scoringAmbiguousUtterancesArraysHtml': string;
          'scoringAmbiguousUtteranceSimpleArrays': string[][];};
        'misclassifiedAnalysis': {
          'scoringMisclassifiedUtterancesArrays': string[][];
          'scoringMisclassifiedUtterancesArraysHtml': string;
          'scoringMisclassifiedUtterancesSimpleArrays': string[][];};
        'lowConfidenceAnalysis': {
          'scoringLowConfidenceUtterancesArrays': string[][];
          'scoringLowConfidenceUtterancesArraysHtml': string;
          'scoringLowConfidenceUtterancesSimpleArrays': string[][];};
        'confusionMatrixAnalysis': {
          'confusionMatrix': MultiLabelConfusionMatrix;
          'multiLabelConfusionMatrixSubset': MultiLabelConfusionMatrixSubset;
          'scoringConfusionMatrixOutputLines': string[][];
          'confusionMatrixMetricsHtml': string;
          'confusionMatrixAverageMetricsHtml': string;}; };
      'scoreStructureArray': ScoreStructure[];
    } = Utility.generateEmptyEvaluationReport();
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
        console.log('  Commandlets: "h", "q", "d", "s", "u", "cu", "i", "ci", "ni", "cni", "p", "v", "vd", "va", "vm", "vl", "a", "r", "c"');
        console.log('    h   - print this help message');
        console.log('    q   - quit');
        console.log('    d   - display the utterance, intent label array caches, and label-index map');
        console.log('    s   - show example label-utterance statistics');
        console.log('    u   - enter a new utterance and save it to the "current" utterance cache');
        console.log('    cu  - clear the "current" utterance cache');
        console.log('    i   - type and add to the "current" intent label array cache ');
        console.log('          (can be an index for retrieving from the label-index map)');
        console.log('    ci  - clear the "current" intent label array cache');
        console.log('    ni  - type and add to the "new" intent label array cache ');
        console.log('          (can be an index for retrieving from the label-index map)');
        console.log('    cni - clear the "new" intent label array cache');
        console.log('    p   - make a prediction on the current utterance');
        console.log('    v   - validate and save analyses (validation report) to');
        console.log(`          "${predictingSetSummaryOutputFilename}"`);
        console.log('    vd  - reference the validation Duplicates report (generated by the "v" command) ');
        console.log('          and enter an index for retrieving utterance/intents into "current"');
        console.log('    va  - reference the validation Ambiguous report (generated by the "v" command) ');
        console.log('          and enter an index for retrieving utterance/intents into "current"');
        console.log('    vm  - reference the validation Misclassified report (generated by the "v" command) ');
        console.log('          and enter an index for retrieving utterance/intents into "current"');
        console.log('    vl  - reference the validation LowConfidence report (generated by the "v" command) ');
        console.log('          and enter an index for retrieving utterance/intents into "current"');
        console.log('    a   - add the "current" utterance and intent labels to the model');
        console.log('    r   - remove the "current" utterance and intent label from the model');
        console.log('    c   - remove the "current" utterance\' intent labels and then ');
        console.log('          add it with the "new" intent labels in the model');
        console.log(`    n   - create a new snapshot and save it to ${trainingFileOutput}`);
        break;
      case 'd': {
        console.log(`  Current utterance:                  "${currentUtterance}"`);
        console.log(`  "Current" intent label array cache: "${currentIntentLabels}"`);
        console.log(`  "New" intent label array cache:     "${newIntentLabels}"`);
        const labelResolverConfig: any = Utility.getLabelResolverSettings(labelResolver);
        console.log(`  Orchestrator configuration:         ${labelResolverConfig}`);
        const labels: string[] = labelResolver.getLabels(LabelType.Intent);
        currentLabelArrayAndMap = Utility.buildStringIdNumberValueDictionaryFromStringArray(
          labels);
        console.log(`  Current label-index map: ${Utility.jsonstringify(currentLabelArrayAndMap.stringMap)}`); }
        break;
      case 's': {
        const utteranceLabelsMap: { [id: string]: string[] } = {};
        const utteranceLabelDuplicateMap: Map<string, Set<string>> = new Map<string, Set<string>>();
        const examples: any = labelResolver.getExamples();
        if (examples.length <= 0) {
          console.log('  There is no example');
          break;
        }
        const labels: string[] = labelResolver.getLabels(LabelType.Intent);
        currentLabelArrayAndMap = Utility.buildStringIdNumberValueDictionaryFromStringArray(
          labels);
        Utility.examplesToUtteranceLabelMaps(examples, utteranceLabelsMap, utteranceLabelDuplicateMap);
        const labelStatisticsAndHtmlTable: {
          'labelUtterancesMap': { [id: string]: string[] };
          'labelUtterancesTotal': number;
          'labelStatistics': string[][];
          'labelStatisticsHtml': string;
        } = Utility.generateLabelStatisticsAndHtmlTable(
          utteranceLabelsMap,
          currentLabelArrayAndMap);
        const labelUtteranceCount: { [id: string]: number } = {};
        Object.entries(labelStatisticsAndHtmlTable.labelUtterancesMap).forEach(
          (x: [string, string[]]) => {
            labelUtteranceCount[x[0]] = x[1].length;
          });
        console.log(`  Per-label #examples: ${Utility.jsonstringify(labelUtteranceCount)}`);
        console.log(`  Total #examples:${labelStatisticsAndHtmlTable.labelUtterancesTotal}`); }
        break;
      case 'u':
        // eslint-disable-next-line no-await-in-loop
        currentUtterance = await question(questionForUtterance);
        break;
      case 'cu':
        // eslint-disable-next-line no-await-in-loop
        currentUtterance = '';
        break;
      case 'i': {
        // eslint-disable-next-line no-await-in-loop
        let label: string = await question(questionForCurrentIntentLabel);
        label = label.trim();
        const errorMessage: string = Utility.parseLabelEntry(
          labelResolver,
          label,
          currentIntentLabels);
        if (Utility.isEmptyString(errorMessage)) {
          console.log(errorMessage);
        } }
        break;
      case 'ci':
        currentIntentLabels = [];
        break;
      case 'ni': {
        // eslint-disable-next-line no-await-in-loop
        let label: string = await question(questionForNewIntentLabel);
        label = label.trim();
        const errorMessage: string = Utility.parseLabelEntry(
          labelResolver,
          label,
          newIntentLabels);
        if (Utility.isEmptyString(errorMessage)) {
          console.log(errorMessage);
        } }
        break;
      case 'cni':
        newIntentLabels = [];
        break;
      case 'p': {
        Utility.resetLabelResolverSettingIgnoreSameExample(labelResolver, false);
        const scoreResults: any = labelResolver.score(currentUtterance, LabelType.Intent);
        if (!scoreResults) {
          continue;
        }
        console.log(`  Prediction:\n${Utility.jsonstringify(scoreResults)}`); }
        break;
      case 'v': {
        const labels: string[] = labelResolver.getLabels(LabelType.Intent);
        const utteranceLabelsMap: { [id: string]: string[] } = {};
        const utteranceLabelDuplicateMap: Map<string, Set<string>> = new Map<string, Set<string>>();
        const examples: any = labelResolver.getExamples();
        if (examples.length <= 0) {
          console.log('  There is no example in the training set, please add some.');
          break;
        }
        Utility.examplesToUtteranceLabelMaps(examples, utteranceLabelsMap, utteranceLabelDuplicateMap);
        Utility.resetLabelResolverSettingIgnoreSameExample(labelResolver, true);
        // ---- NOTE ---- integrated step to produce analysis reports.
        evaluationOutput = Utility.generateEvaluationReport(
          labelResolver,
          labels,
          utteranceLabelsMap,
          utteranceLabelDuplicateMap,
          labelsOutputFilename,
          predictingSetScoreOutputFilename,
          predictingSetSummaryOutputFilename);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`evaluationOutput=${Utility.jsonstringify(evaluationOutput)}`);
        } }
        break;
      case 'vd': {
        if (!evaluationOutput) {
          console.log('  There is no validation report, please use the "v" command to create one');
          break;
        }
        const labelUtterancesTotal: number =
          evaluationOutput.evaluationReportLabelUtteranceStatistics.labelStatisticsAndHtmlTable.labelUtterancesTotal;
        if (labelUtterancesTotal <= 0) {
          console.log('  There is no examples or there is no validation report, please use the "v" command to create one');
          break;
        }
        const utterancesMultiLabelArrays: [string, string][] =
          evaluationOutput.evaluationReportLabelUtteranceStatistics.utterancesMultiLabelArrays;
        // eslint-disable-next-line no-await-in-loop
        let indexInput: string = await question(questionForUtteranceLabelsFromDuplicates);
        indexInput = indexInput.trim();
        if (Utility.isEmptyString(indexInput)) {
          console.log('  Please enter an integer index to access the validation Duplicates entry');
          break;
        }
        if (Number.isInteger(Number(indexInput))) {
          const index: number = Number(indexInput);
          // eslint-disable-next-line max-depth
          if ((index < 0) || (index >= utterancesMultiLabelArrays.length)) {
            const errorMessage: string =
              `  The index "${index}" you entered is not in range, the array length is: ${utterancesMultiLabelArrays.length}`;
            console.log(errorMessage);
            break;
          }
          currentUtterance = utterancesMultiLabelArrays[index][0];
          currentIntentLabels = utterancesMultiLabelArrays[index][1].split(',');
        } else {
          console.log('  Please enter an integer index to access the validation Duplicates entry');
          break;
        } }
        break;
      case 'va': {
        if (!evaluationOutput) {
          console.log('  There is no validation report, please use the "v" command to create one');
          break;
        }
        const labelUtterancesTotal: number =
          evaluationOutput.evaluationReportLabelUtteranceStatistics.labelStatisticsAndHtmlTable.labelUtterancesTotal;
        if (labelUtterancesTotal <= 0) {
          console.log('  There is no examples or there is no validation report, please use the "v" command to create one');
          break;
        }
        const scoringAmbiguousUtterancesSimpleArrays: string[][] =
          evaluationOutput.evaluationReportAnalyses.ambiguousAnalysis.scoringAmbiguousUtteranceSimpleArrays;
        // eslint-disable-next-line no-await-in-loop
        let indexInput: string = await question(questionForUtteranceLabelsFromAmbiguous);
        indexInput = indexInput.trim();
        if (Utility.isEmptyString(indexInput)) {
          console.log('  Please enter an integer index to access the validation Ambiguous entry');
          break;
        }
        if (Number.isInteger(Number(indexInput))) {
          const index: number = Number(indexInput);
          // eslint-disable-next-line max-depth
          if ((index < 0) || (index >= scoringAmbiguousUtterancesSimpleArrays.length)) {
            const errorMessage: string =
              `  The index "${index}" you entered is not in range, the array length is: ${scoringAmbiguousUtterancesSimpleArrays.length}`;
            console.log(errorMessage);
            break;
          }
          currentUtterance = scoringAmbiguousUtterancesSimpleArrays[index][0];
          currentIntentLabels = scoringAmbiguousUtterancesSimpleArrays[index][1].split(',');
        } else {
          console.log('  Please enter an integer index to access the validation Ambiguous entry');
          break;
        } }
        break;
      case 'vm': {
        if (!evaluationOutput) {
          console.log('  There is no validation report, please use the "v" command to create one');
          break;
        }
        const labelUtterancesTotal: number =
          evaluationOutput.evaluationReportLabelUtteranceStatistics.labelStatisticsAndHtmlTable.labelUtterancesTotal;
        if (labelUtterancesTotal <= 0) {
          console.log('  There is no examples or there is no validation report, please use the "v" command to create one');
          break;
        }
        const scoringMisclassifiedUtterancesSimpleArrays: string[][] =
          evaluationOutput.evaluationReportAnalyses.misclassifiedAnalysis.scoringMisclassifiedUtterancesSimpleArrays;
        // eslint-disable-next-line no-await-in-loop
        let indexInput: string = await question(questionForUtteranceLabelsFromMisclassified);
        indexInput = indexInput.trim();
        if (Utility.isEmptyString(indexInput)) {
          console.log('  Please enter an integer index to access the validation Misclassified entry');
          break;
        }
        if (Number.isInteger(Number(indexInput))) {
          const index: number = Number(indexInput);
          // eslint-disable-next-line max-depth
          if ((index < 0) || (index >= scoringMisclassifiedUtterancesSimpleArrays.length)) {
            const errorMessage: string =
              `  The index "${index}" you entered is not in range, the array length is: ${scoringMisclassifiedUtterancesSimpleArrays.length}`;
            console.log(errorMessage);
            break;
          }
          currentUtterance = scoringMisclassifiedUtterancesSimpleArrays[index][0];
          currentIntentLabels = scoringMisclassifiedUtterancesSimpleArrays[index][1].split(',');
        } else {
          console.log('  Please enter an integer index to access the validation Misclassified entry');
          break;
        } }
        break;
      case 'vl': {
        if (!evaluationOutput) {
          console.log('  There is no validation report, please use the "v" command to create one');
          break;
        }
        const labelUtterancesTotal: number =
          evaluationOutput.evaluationReportLabelUtteranceStatistics.labelStatisticsAndHtmlTable.labelUtterancesTotal;
        if (labelUtterancesTotal <= 0) {
          console.log('  There is no examples or there is no validation report, please use the "v" command to create one');
          break;
        }
        const scoringLowConfidenceUtterancesSimpleArrays: string[][] =
          evaluationOutput.evaluationReportAnalyses.lowConfidenceAnalysis.scoringLowConfidenceUtterancesSimpleArrays;
        // eslint-disable-next-line no-await-in-loop
        let indexInput: string = await question(questionForUtteranceLabelsFromLowConfidence);
        indexInput = indexInput.trim();
        if (Utility.isEmptyString(indexInput)) {
          console.log('  Please enter an integer index to access the validation LowConfidence entry');
          break;
        }
        if (Number.isInteger(Number(indexInput))) {
          const index: number = Number(indexInput);
          // eslint-disable-next-line max-depth
          if ((index < 0) || (index >= scoringLowConfidenceUtterancesSimpleArrays.length)) {
            const errorMessage: string =
              `  The index "${index}" you entered is not in range, the array length is: ${scoringLowConfidenceUtterancesSimpleArrays.length}`;
            console.log(errorMessage);
            break;
          }
          currentUtterance = scoringLowConfidenceUtterancesSimpleArrays[index][0];
          currentIntentLabels = scoringLowConfidenceUtterancesSimpleArrays[index][1].split(',');
        } else {
          console.log('  Please enter an integer index to access the validation LowConfidence entry');
          break;
        } }
        break;
      case 'a': {
        const example: Example = Example.newIntentExample(
          currentUtterance,
          currentIntentLabels);
        const exampleObejct: any = example.toObject();
        Utility.debuggingLog(`exampleObejct=${Utility.jsonstringify(exampleObejct)}`);
        const rvAddExample: any = labelResolver.addExample(exampleObejct);
        Utility.debuggingLog(`rv=${rvAddExample}`);
        if (!rvAddExample) {
          console.log(`  There is an error, the example was not added, example: ${Utility.jsonstringify(exampleObejct)}`);
          break;
        } }
        break;
      case 'r': {
        const example: Example = Example.newIntentExample(
          currentUtterance,
          currentIntentLabels);
        const exampleObejct: any = example.toObject();
        Utility.debuggingLog(`exampleObejct=${Utility.jsonstringify(exampleObejct)}`);
        const rvRemoveExample: any = labelResolver.removeExample(exampleObejct);
        Utility.debuggingLog(`rv=${rvRemoveExample}`);
        if (!rvRemoveExample) {
          console.log(`  There is an error, the example was not removed, example: ${Utility.jsonstringify(exampleObejct)}`);
          break;
        } }
        break;
      case 'c': {
        const exampleToRemove: Example = Example.newIntentExample(
          currentUtterance,
          currentIntentLabels);
        const exampleObejctToRemove: any = exampleToRemove.toObject();
        Utility.debuggingLog(`exampleObejctToRemove=${Utility.jsonstringify(exampleObejctToRemove)}`);
        const rvRemoveExample: any = labelResolver.removeExample(exampleObejctToRemove);
        Utility.debuggingLog(`rvRemoveExample=${rvRemoveExample}`);
        if (!rvRemoveExample) {
          console.log(`  There is an error, the example was not removed, example: ${Utility.jsonstringify(exampleObejctToRemove)}`);
          break;
        }
        const exampleToAdd: Example = Example.newIntentExample(
          currentUtterance,
          newIntentLabels);
        const exampleObejctToAdd: any = exampleToAdd.toObject();
        Utility.debuggingLog(`exampleObejctToAdd=${Utility.jsonstringify(exampleObejctToAdd)}`);
        const rvAddExample: any = labelResolver.addExample(exampleObejctToAdd);
        Utility.debuggingLog(`rvAddExample=${rvAddExample}`);
        if (!rvAddExample) {
          console.log(`  There is an error, the example was not added, example: ${Utility.jsonstringify(exampleObejctToAdd)}`);
          break;
        } }
        break;
      case 'n': {
        const snapshot: any = labelResolver.createSnapshot();
        OrchestratorHelper.writeToFile(trainingFileOutput, snapshot);
        console.log(`  A new snapshot has been saved to ${trainingFileOutput}`);
        Utility.debuggingLog(`Snapshot written to ${trainingFileOutput}`); }
        break;
      default:
        console.log(`  Cannot recognize the command you just entered "${command}",`);
        console.log('  please type "h" for help!');
        break;
      }
    }
    // eslint-disable-next-line no-console
    console.log('Bye!');
    return 0;
  }
}
