/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

// import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher';
// import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher';

import {LabelType} from './label-type';
// import {ScoreStructure}  from './score-structure';

import {LabelResolver} from './labelresolver';

import {Utility} from './utility';

export class OrchestratorEvaluate {
  public static async runAsync(inputPath: string, outputPath: string, nlrPath: string = ''): Promise<void> {
    // ---- NOTE ---- process arguments
    if (Utility.isEmptyString(inputPath)) {
      Utility.debuggingThrow('Please provide path to input file/folder');
    }
    if (Utility.isEmptyString(outputPath)) {
      Utility.debuggingThrow('Please provide an output directory');
    }
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    } else {
      nlrPath = '';
    }
    // ---- NOTE ---- load the training set
    const trainingFile: string = path.join(inputPath, 'orchestrator.blu');
    if (!Utility.exists(trainingFile)) {
      Utility.debuggingThrow(`training set file does not exist, trainingFile=${trainingFile}`);
    }
    const trainingSetScoreOutputFile: string = path.join(outputPath, 'orchestrator_training_set_scores.txt');
    const trainingSetSummaryOutputFile: string = path.join(outputPath, 'orchestrator_training_set_summary.html');
    const labelsOutputFilename: string = path.join(outputPath, 'orchestrator_labels.txt');

    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), ready to call LabelResolver.createWithSnapshotAsync()');
    const labelResolver: any = await LabelResolver.createWithSnapshotAsync(nlrPath, trainingFile);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), after calling LabelResolver.createWithSnapshotAsync()');

    // ---- NOTE ---- retrieve labels
    const labels: string[] = labelResolver.getLabels(LabelType.Intent);
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      // Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(labelArrayAndMap.stringArray)}`);
      // Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(labelArrayAndMap.stringMap)}`);
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
    }

    // ---- NOTE ---- retrieve examples, process the training set, retrieve labels, and create a label-index map.
    const utterancesLabelsMap: { [id: string]: string[] } = {};
    const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    const examples: any = labelResolver.getExamples();
    if (examples.length <= 0) {
      Utility.debuggingThrow('there is no example, something wrong?');
    }
    Utility.examplesToUtteranceLabelMaps(examples, utterancesLabelsMap, utterancesDuplicateLabelsMap);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), examples.length=${examples.length}`);
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      const examples: any = labelResolver.getExamples();
      const example: any = examples[0];
      const example_text: string = example.text;
      const labels: any = example.labels;
      const label: any = labels[0];
      const label_name: string = label.name;
      const label_type: any = label.label_type;
      const span: any = label.span;
      const offset: number = span.offset;
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), examples.length=${examples.length}`);
      const length: number = span.length;
      // Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(examples)=${JSON.stringify(examples)}`);
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(example)=${JSON.stringify(example)}`);
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), Object.keys(example)=${Object.keys(example)}`);
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), example_text=${example_text}`);
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
      labels,
      utterancesLabelsMap,
      utterancesDuplicateLabelsMap,
      labelsOutputFilename,
      trainingSetScoreOutputFile,
      trainingSetSummaryOutputFile);

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
      labels,
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
      trainingSetScoreOutputFile,
      scoreOutputLines);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finishing calling Utility.storeDataArraysToTsvFile');

    // ---- NOTE ---- produce the evaluation summary file.
    Utility.dumpFile(
      trainingSetSummaryOutputFile,
      evaluationReportAnalyses.evaluationSummaryTemplate);

    // ---- NOTE ---- debugging ouput.
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(evaluationReportLabelUtteranceStatistics.labelArrayAndMap.stringArray)}`);
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(evaluationReportLabelUtteranceStatistics.labelArrayAndMap.stringMap)}`);
      const labels: any = labelResolver.getLabels();
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
    }
    */

    // ---- NOTE ---- the end
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), the end');
  }
}
