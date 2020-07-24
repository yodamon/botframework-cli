/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/MultiLabelConfusionMatrix';
import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/MultiLabelConfusionMatrixSubset';

import {LabelType} from './label-type';
import {ScoreStructure}  from './score-structure';

import {LabelResolver} from './labelresolver';

import {EvaluationSummaryTemplateHtml} from './resources/evaluation-summary-template-html';
import {Utility} from './utility';

export class OrchestratorEvaluate {
  public static async runAsync(inputPath: string, outputPath: string, nlrPath: string = '') {
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
    const trainingFile: string = path.join(inputPath, 'orchestrator.blu');
    if (!Utility.exists(trainingFile)) {
      Utility.debuggingThrow(`training set file does not exist, trainingFile=${trainingFile}`);
    }
    const trainingSetScoreOutputFile: string = path.join(outputPath, 'orchestrator_training_set_scores.txt');
    const trainingSetSummaryOutputFile: string = path.join(outputPath, 'orchestrator_training_set_summary.html');

    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), ready to call LabelResolver.createWithSnapshotAsync()');
    const labelResolver: any = await LabelResolver.createWithSnapshotAsync(nlrPath, trainingFile);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), after calling LabelResolver.createWithSnapshotAsync()');

    // ---- NOTE ---- load the evaluation summary template.
    let evaluationSummaryTemplate: string = EvaluationSummaryTemplateHtml.html;

    // ---- NOTE ---- retrieve labels, and create a label-index map.
    const labels: string[] = labelResolver.getLabels(LabelType.Intent);
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      // Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(labelArrayAndMap.stringArray)}`);
      // Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(labelArrayAndMap.stringMap)}`);
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
    }
    const labelArrayAndMap: {
      'stringArray': string[];
      'stringMap': {[id: string]: number};} = Utility.buildStringIdNumberValueDictionaryFromStringArray(
        labels);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(labelArrayAndMap.stringArray)}`);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(labelArrayAndMap.stringMap)}`);

    // ---- NOTE ---- retrieve examples, process the training set, retrieve labels, and create a label-index map.
    const utterancesLabelsMap: { [id: string]: string[] } = {};
    const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    const examples: any = labelResolver.getExamples();
    Utility.examplesToUtteranceLabelMaps(examples, utterancesLabelsMap, utterancesDuplicateLabelsMap);
    Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), examples.length=${examples.length}`);

    // ---- NOTE ---- generate label statistics.
    const labelStatisticsAndHtmlTable: {
      'labelStatistics': string[][];
      'labelStatisticsHtml': string;
    } = Utility.generateLabelStatisticsAndHtmlTable(
      utterancesLabelsMap,
      labelArrayAndMap);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finish calling Utility.generateLabelStatisticsAndHtmlTable()');
    // ---- NOTE ---- generate utterance statistics
    const utteranceStatisticsAndHtmlTable: {
      'utteranceStatistics': string[][];
      'utteranceStatisticsHtml': string;
    } = Utility.generateUtteranceStatisticsAndHtmlTable(
      utterancesLabelsMap);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finish calling Utility.generateUtteranceStatisticsAndHtmlTable()');
    // ---- NOTE ---- create the evaluation INTENTUTTERANCESTATISTICS summary from template.
    const intentsUtterancesStatisticsHtml: string =
    labelStatisticsAndHtmlTable.labelStatisticsHtml + utteranceStatisticsAndHtmlTable.utteranceStatisticsHtml;
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{INTENTUTTERANCESTATISTICS}', intentsUtterancesStatisticsHtml);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finished generating {INTENTUTTERANCESTATISTICS} content');

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
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finished generating {DUPLICATES} content');

    // ---- NOTE ---- collect utterance prediction and scores.
    const utteranceLabelsPairArray: [string, string[]][] = Object.entries(utterancesLabelsMap);
    const scoreStructureArray: ScoreStructure[] = Utility.score(
      labelResolver,
      utteranceLabelsPairArray,
      labelArrayAndMap);
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

    // ---- NOTE ---- generate ambiguous HTML.
    const ambiguousAnalysis: {
      'scoringAmbiguousOutputLines': string[][];
      'scoringAmbiguousUtterancesArraysHtml': string;
    } = Utility.generateAmbiguousStatisticsAndHtmlTable(
      scoreStructureArray);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{AMBIGUOUS}', ambiguousAnalysis.scoringAmbiguousUtterancesArraysHtml);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finished generating {AMBIGUOUS} content');

    // ---- NOTE ---- generate misclassified HTML.
    const misclassifiedAnalysis: {
      'scoringMisclassifiedOutputLines': string[][];
      'scoringMisclassifiedUtterancesArraysHtml': string;
    } = Utility.generateMisclassifiedStatisticsAndHtmlTable(
      scoreStructureArray);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{MISCLASSIFICATION}', misclassifiedAnalysis.scoringMisclassifiedUtterancesArraysHtml);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finished generating {MISCLASSIFICATION} content');

    // ---- NOTE ---- generate low-confidence HTML.
    const lowConfidenceAnalysis: {
      'scoringLowConfidenceOutputLines': string[][];
      'scoringLowConfidenceUtterancesArraysHtml': string;
    } = Utility.generateLowConfidenceStatisticsAndHtmlTable(
      scoreStructureArray);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{LOWCONFIDENCE}', lowConfidenceAnalysis.scoringLowConfidenceUtterancesArraysHtml);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finished generating {LOWCONFIDENCE} content');

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
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finished generating {MODELEVALUATION} content');

    // ---- NOTE ---- produce a score TSV file.
    const scoreOutputLines: string[][] = Utility.generateScoreOutputLines(
      scoreStructureArray
    );
    Utility.storeDataArraysToTsvFile(
      trainingSetScoreOutputFile,
      scoreOutputLines);
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), finishing calling Utility.storeDataArraysToTsvFile');

    // ---- NOTE ---- produce the evaluation summary file.
    Utility.dumpFile(trainingSetSummaryOutputFile, evaluationSummaryTemplate);

    // ---- NOTE ---- debugging ouput.
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(labelArrayAndMap.stringArray)}`);
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(labelArrayAndMap.stringMap)}`);
      const labels: any = labelResolver.getLabels();
      Utility.debuggingLog(`OrchestratorEvaluate.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
    }

    // ---- NOTE ---- the end
    Utility.debuggingLog('OrchestratorEvaluate.runAsync(), the end');
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
  //       throw new Error('Please provide path to Orchestrator model');
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
