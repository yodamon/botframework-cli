/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/MultiLabelConfusionMatrix';
import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/MultiLabelConfusionMatrixSubset';

import {ScoreStructure}  from './score-structure';

import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

import {EvaluationSummaryTemplateHtml} from './resources/evaluation-summary-template-html';
import {Utility} from './utility';

export class OrchestratorTest {
  // eslint-disable-next-line complexity
  public static async runAsync(nlrPath: string, inputPath: string, testPath: string, outputPath: string) {
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
    const trainingFile: string = path.join(inputPath, 'orchestrator.blu');
    if (!Utility.exists(trainingFile)) {
      Utility.debuggingThrow(`training set file does not exist, trainingFile=${trainingFile}`);
    }
    const testingSetScoreOutputFile: string = path.join(outputPath, 'orchestrator_testing_set_scores.txt');
    const testingSetSummaryOutputFile: string = path.join(outputPath, 'orchestrator_testing_set_summary.html');

    // ---- NOTE ---- create a LabelResolver object.
    Utility.debuggingLog('OrchestratorTest.runAsync(), ready to call LabelResolver.createWithSnapshotAsync()');
    const labelResolver: any = await LabelResolver.createWithSnapshotAsync(nlrPath, trainingFile);
    Utility.debuggingLog('OrchestratorTest.runAsync(), after calling LabelResolver.createWithSnapshotAsync()');

    // ---- NOTE ---- process the training set, retrieve labels, and create a label-index map.
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

    // ---- NOTE ---- process the testing set.
    const utterancesLabelsMap: { [id: string]: string[] } = {};
    const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    await OrchestratorHelper.processFile(testPath, path.basename(testPath), utterancesLabelsMap, utterancesDuplicateLabelsMap, false);
    Utility.debuggingLog('OrchestratorTest.runAsync(), after calling OrchestratorHelper.processFile()');
    // Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(utterancesLabelsMap)=${JSON.stringify(utterancesLabelsMap)}`);
    // ---- Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utterancesDuplicateLabelsMap))=${JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utterancesDuplicateLabelsMap))}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of unique utterances=${Object.keys(utterancesLabelsMap).length}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of duplicate utterance/label pairs=${utterancesDuplicateLabelsMap.size}`);

    // ---- NOTE ---- load the evaluation summary template.
    let evaluationSummaryTemplate: string = EvaluationSummaryTemplateHtml.html;

    // ---- NOTE ---- generate label statistics.
    const labelStatisticsAndHtmlTable: {
      'labelStatistics': string[][];
      'labelStatisticsHtml': string;
    } = Utility.generateLabelStatisticsAndHtmlTable(
      utterancesLabelsMap,
      labelArrayAndMap);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finish calling Utility.generateLabelStatisticsAndHtmlTable()');
    // ---- NOTE ---- generate utterance statistics
    const utteranceStatisticsAndHtmlTable: {
      'utteranceStatistics': string[][];
      'utteranceStatisticsHtml': string;
    } = Utility.generateUtteranceStatisticsAndHtmlTable(
      utterancesLabelsMap);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finish calling Utility.generateUtteranceStatisticsAndHtmlTable()');
    // ---- NOTE ---- create the evaluation INTENTUTTERANCESTATISTICS summary from template.
    const intentsUtterancesStatisticsHtml: string =
    labelStatisticsAndHtmlTable.labelStatisticsHtml + utteranceStatisticsAndHtmlTable.utteranceStatisticsHtml;
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{INTENTUTTERANCESTATISTICS}', intentsUtterancesStatisticsHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {INTENTUTTERANCESTATISTICS} content');

    // ---- NOTE ---- generate duplicate report.
    const utterancesMultiLabelArrays: [string, string][] = Object.entries(utterancesLabelsMap).filter(
      (x: [string, string[]]) => x[1].length > 1).map((x: [string, string[]]) => [x[0], x[1].join(',')]);
    const utterancesMultiLabelArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Multi-label utterances and their intents',
      utterancesMultiLabelArrays,
      ['Utterance', 'Intents']);
    // ---- NOTE ---- generate duplicate report.
    const utterancesDuplicateLabelsHtml: string = Utility.convertMapSetToIndexedHtmlTable(
      'Duplicate utterance and intent pairs',
      utterancesDuplicateLabelsMap,
      ['Utterance', 'Intent']);
    // ---- NOTE ---- create the evaluation DUPLICATES summary from template.
    const duplicateStatisticsHtml: string =
      utterancesMultiLabelArraysHtml + utterancesDuplicateLabelsHtml;
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{DUPLICATES}', duplicateStatisticsHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {DUPLICATES} content');

    // ---- NOTE ---- collect utterance prediction and scores.
    const utteranceLabelsPairArray: [string, string[]][] = Object.entries(utterancesLabelsMap);
    const scoreStructureArray: ScoreStructure[] = Utility.score(
      labelResolver,
      utteranceLabelsPairArray,
      labelArrayAndMap);

    // ---- NOTE ---- generate ambiguous HTML.
    const ambiguousAnalysis: {
      'scoringAmbiguousOutputLines': string[][];
      'scoringAmbiguousUtterancesArraysHtml': string;
    } = Utility.generateAmbiguousStatisticsAndHtmlTable(
      scoreStructureArray);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{AMBIGUOUS}', ambiguousAnalysis.scoringAmbiguousUtterancesArraysHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {AMBIGUOUS} content');

    // ---- NOTE ---- generate misclassified HTML.
    const misclassifiedAnalysis: {
      'scoringMisclassifiedOutputLines': string[][];
      'scoringMisclassifiedUtterancesArraysHtml': string;
    } = Utility.generateMisclassifiedStatisticsAndHtmlTable(
      scoreStructureArray);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{MISCLASSIFICATION}', misclassifiedAnalysis.scoringMisclassifiedUtterancesArraysHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {MISCLASSIFICATION} content');

    // ---- NOTE ---- generate low-confidence HTML.
    const lowConfidenceAnalysis: {
      'scoringLowConfidenceOutputLines': string[][];
      'scoringLowConfidenceUtterancesArraysHtml': string;
    } = Utility.generateLowConfidenceStatisticsAndHtmlTable(
      scoreStructureArray);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{LOWCONFIDENCE}', lowConfidenceAnalysis.scoringLowConfidenceUtterancesArraysHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {LOWCONFIDENCE} content');

    // ---- NOTE ---- produce confusion matrix result.
    const confusionMatrixAnalysis: {
      'confusionMatrix': MultiLabelConfusionMatrix;
      'multiLabelConfusionMatrixSubset': MultiLabelConfusionMatrixSubset;
      'scoreOutputLinesConfusionMatrix': string[][];
      'confusionMatrixHtml': string;
    } = Utility.generateConfusionMatrixMetricsAndHtmlTable(
      scoreStructureArray,
      labelArrayAndMap);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{MODELEVALUATION}', confusionMatrixAnalysis.confusionMatrixHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {MODELEVALUATION} content');

    // ---- NOTE ---- produce a score TSV file.
    const scoreOutputLines: string[][] = Utility.generateScoreOutputLines(
      scoreStructureArray
    );
    Utility.storeDataArraysToTsvFile(
      testingSetScoreOutputFile,
      scoreOutputLines);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finishing calling Utility.storeDataArraysToTsvFile');

    // ---- NOTE ---- produce the evaluation summary file.
    Utility.dumpFile(testingSetSummaryOutputFile, evaluationSummaryTemplate);

    // ---- NOTE ---- debugging ouput.
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(labelArrayAndMap.stringArray)}`);
      Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(labelArrayAndMap.stringMap)}`);
      const labels: any = labelResolver.getLabels();
      Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
    }

    // ---- NOTE ---- the end
    Utility.debuggingLog('OrchestratorTest.runAsync(), the end');
  }
}
