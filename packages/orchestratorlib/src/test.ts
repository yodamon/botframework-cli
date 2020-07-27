/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

// import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher';
// import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher';

// import {ScoreStructure}  from './score-structure';

import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

import {Utility} from './utility';

export class OrchestratorTest {
  // eslint-disable-next-line complexity
  public static async runAsync(nlrPath: string, inputPath: string, testPath: string, outputPath: string): Promise<void> {
    // ---- NOTE ---- process arguments
    if (Utility.isEmptyString(inputPath)) {
      Utility.debuggingThrow('Please provide path to input file/folder');
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
    const trainingFile: string = path.join(inputPath, 'orchestrator.blu');
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
    const utterancesLabelsMap: { [id: string]: string[] } = {};
    const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    await OrchestratorHelper.processFile(testPath, path.basename(testPath), utterancesLabelsMap, utterancesDuplicateLabelsMap, false);
    Utility.debuggingLog('OrchestratorTest.runAsync(), after calling OrchestratorHelper.processFile()');
    // Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(utterancesLabelsMap)=${JSON.stringify(utterancesLabelsMap)}`);
    // ---- Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utterancesDuplicateLabelsMap))=${JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utterancesDuplicateLabelsMap))}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of unique utterances=${Object.keys(utterancesLabelsMap).length}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of duplicate utterance/label pairs=${utterancesDuplicateLabelsMap.size}`);
    if (Object.entries(utterancesLabelsMap).length <= 0) {
      Utility.debuggingThrow('there is no example, something wrong?');
    }

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
      trainingSetLabels,
      utterancesLabelsMap,
      utterancesDuplicateLabelsMap,
      labelsOutputFilename,
      testingSetScoreOutputFile,
      testingSetSummaryOutputFile);

    /*
    // ---- NOTE ---- generate evaluation report before calling the score() function.
    const evaluationReportLabelUtteranceStatistics: {
      'evaluationSummaryTemplate': string;
      'labelArrayAndMap': {
        'stringArray': string[];
        'stringMap': {[id: string]: number};};
      'labelStatisticsAndHtmlTable': {
        'labelStatistics': string[][];
        'labelStatisticsHtml': string;};
      'utteranceStatisticsAndHtmlTable': {
        'utteranceStatistics': [string, number][];
        'utteranceStatisticsHtml': string;};
      'utterancesMultiLabelArrays': [string, string][];
      'utterancesMultiLabelArraysHtml': string;
      'utterancesDuplicateLabelsHtml': string;
    } = Utility.generateEvaluationReportLabelUtteranceStatistics(
      trainingSetLabels,
      utterancesLabelsMap,
      utterancesDuplicateLabelsMap);

    // ---- NOTE ---- output the labels by their index order to a file.
    Utility.storeDataArraysToTsvFile(
      labelsOutputFilename,
      evaluationReportLabelUtteranceStatistics.labelArrayAndMap.stringArray.map((x: string) => [x]));

    // ---- NOTE ---- collect utterance prediction and scores.
    const utteranceLabelsPairArray: [string, string[]][] = Object.entries(utterancesLabelsMap);
    const scoreStructureArray: ScoreStructure[] = Utility.score(
      labelResolver,
      utteranceLabelsPairArray,
      evaluationReportLabelUtteranceStatistics.labelArrayAndMap);

    // ---- NOTE ---- generate evaluation report after calling the score() function.
    const evaluationReportAnalyses: {
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
        'confusionMatrixAverageMetricsHtml': string;};
    } = Utility.generateEvaluationReportAnalyses(
      evaluationReportLabelUtteranceStatistics.evaluationSummaryTemplate,
      evaluationReportLabelUtteranceStatistics.labelArrayAndMap,
      scoreStructureArray);

    // ---- NOTE ---- produce a score TSV file.
    const scoreOutputLines: string[][] = Utility.generateScoreOutputLines(
      scoreStructureArray);
    Utility.storeDataArraysToTsvFile(
      testingSetScoreOutputFile,
      scoreOutputLines);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finishing calling Utility.storeDataArraysToTsvFile');

    // ---- NOTE ---- produce the evaluation summary file.
    Utility.dumpFile(
      testingSetSummaryOutputFile,
      evaluationReportAnalyses.evaluationSummaryTemplate);

    // ---- NOTE ---- debugging ouput.
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(evaluationReportLabelUtteranceStatistics.labelArrayAndMap.stringArray)}`);
      Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(evaluationReportLabelUtteranceStatistics.labelArrayAndMap.stringMap)}`);
      const labels: any = labelResolver.getLabels();
      Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
    }
    */

    // ---- NOTE ---- the end
    Utility.debuggingLog('OrchestratorTest.runAsync(), the end');
  }
}
