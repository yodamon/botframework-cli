/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher';
import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher';

import {ScoreStructure}  from './score-structure';

import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

import {Utility} from './utility';

export class OrchestratorTest {
  // eslint-disable-next-line complexity
  public static async runAsync(nlrPath: string, inputPath: string, testPath: string, outputPath: string): Promise<void> {
    // ---- NOTE ---- process arguments
    if (Utility.isEmptyString(inputPath)) {
      Utility.debuggingThrow('Please provide path to an input .blu file');
    }
    if (Utility.isEmptyString(testPath)) {
      Utility.debuggingThrow('Please provide a test file');
    }
    if (Utility.isEmptyString(outputPath)) {
      Utility.debuggingThrow('Please provide an output directory');
    }
    if (Utility.isEmptyString(nlrPath)) {
      Utility.debuggingThrow('The nlrPath argument is empty');
    }
    nlrPath = path.resolve(nlrPath);

    // ---- NOTE ---- load the training set
    const trainingFile: string = inputPath;
    if (!Utility.exists(trainingFile)) {
      Utility.debuggingThrow(`training set file does not exist, trainingFile=${trainingFile}`);
    }
    const testingSetScoreOutputFile: string = path.join(outputPath, 'orchestrator_testing_set_scores.txt');
    const testingSetSummaryOutputFile: string = path.join(outputPath, 'orchestrator_testing_set_summary.html');
    const labelsOutputFilename: string = path.join(outputPath, 'orchestrator_labels.txt');

    // ---- NOTE ---- create a LabelResolver object.
    Utility.debuggingLog('OrchestratorTest.runAsync(), ready to call LabelResolver.createWithSnapshotAsync()');
    const labelResolver: any = await LabelResolver.createWithSnapshotAsync(nlrPath, trainingFile);
    Utility.debuggingLog('OrchestratorTest.runAsync(), after calling LabelResolver.createWithSnapshotAsync()');

    // ---- NOTE ---- process the training set, retrieve labels
    const trainingSetUtterancesLabelsMap: { [id: string]: string[] } = {};
    const trainingSetUtterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    await OrchestratorHelper.processFile(trainingFile, path.basename(trainingFile), trainingSetUtterancesLabelsMap, trainingSetUtterancesDuplicateLabelsMap, false);
    const trainingSetLabels: string[] =
      [...Object.values(trainingSetUtterancesLabelsMap)].reduce(
        (accumulant: string[], entry: string[]) => accumulant.concat(entry), []);

    // ---- NOTE ---- process the testing set.
    const utteranceLabelsMap: { [id: string]: string[] } = {};
    const utteranceLabelDuplicateMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    await OrchestratorHelper.processFile(testPath, path.basename(testPath), utteranceLabelsMap, utteranceLabelDuplicateMap, false);
    Utility.debuggingLog('OrchestratorTest.runAsync(), after calling OrchestratorHelper.processFile()');
    // Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(utteranceLabelsMap)=${JSON.stringify(utteranceLabelsMap)}`);
    // ---- Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utteranceLabelDuplicateMap))=${JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utteranceLabelDuplicateMap))}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of unique utterances=${Object.keys(utteranceLabelsMap).length}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of duplicate utterance/label pairs=${utteranceLabelDuplicateMap.size}`);
    if (Object.entries(utteranceLabelsMap).length <= 0) {
      Utility.debuggingThrow('there is no example, something wrong?');
    }

    // ---- NOTE ---- integrated step to produce analysis reports.
    Utility.resetLabelResolverSettingIgnoreSameExample(labelResolver, false);
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
    } =
    Utility.generateEvaluationReport(
      labelResolver,
      trainingSetLabels,
      utteranceLabelsMap,
      utteranceLabelDuplicateMap,
      labelsOutputFilename,
      testingSetScoreOutputFile,
      testingSetSummaryOutputFile);
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      Utility.debuggingLog(`evaluationOutput=${Utility.jsonStringify(evaluationOutput)}`);
    }

    // ---- NOTE ---- THE END
    Utility.debuggingLog('OrchestratorTest.runAsync(), THE END');
  }
}
