/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Utility} from './utility';
import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';
import {EvaluationSummaryTemplateHtml} from './resources/evaluation-summary-template-html';

export class OrchestratorTest {
  // eslint-disable-next-line complexity
  public static async runAsync(nlrPath: string, inputPath: string, testPath: string, outputPath: string) {
    if (!inputPath || inputPath.length === 0) {
      throw new Error('Please provide path to input file/folder');
    }
    if (!testPath || testPath.length === 0) {
      throw new Error('Please provide a test file');
    }
    if (!outputPath || outputPath.length === 0) {
      throw new Error('Please provide an output directory');
    }
    nlrPath = path.resolve(nlrPath);
    const trainingFile: string = path.join(inputPath, 'orchestrator.blu');
    const testingSetScoreOutputFile: string = path.join(outputPath, 'orchestrator_testing_set_scores.txt');
    const testingSetSummaryOutputFile: string = path.join(outputPath, 'orchestrator_testing_set_summary.html');
    // ---- NOTE ---- create a LabelResolver object.
    const labelResolver: any = await LabelResolver.createWithSnapshotAsync(nlrPath, trainingFile);
    Utility.debuggingLog('OrchestratorTest.runAsync(), after calling LabelResolver.createWithSnapshotAsync()');
    // ---- NOTE ---- process the training set, retrieve labels, and create a label-index map.
    const trainingSetUtterancesLabelsMap: { [id: string]: string[] } = {};
    const trainingSetUtterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    await OrchestratorHelper.processFile(trainingFile, path.basename(trainingFile), trainingSetUtterancesLabelsMap, trainingSetUtterancesDuplicateLabelsMap, false);
    const trainingSetLabels: string[] =
      [...Object.values(trainingSetUtterancesLabelsMap)].reduce(
        (accumulant: string[], entry: string[]) => accumulant.concat(entry), []).sort(
        (n1: string, n2: string) => {
          if (n1 > n2) {
            return 1;
          }
          if (n1 < n2) {
            return -1;
          }
          return 0;
        });
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
    // ---- Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(utterancesDuplicateLabelsMap))=${JSON.stringify(Utility.convertStringKeyGenericSetNativeMapToDictionary<string>(testingSetUtterancesDuplicateLabelsMap))}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of unique utterances=${Object.keys(utterancesLabelsMap).length}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of duplicate utterance/label pairs=${utterancesDuplicateLabelsMap.size}`);
    // ---- NOTE ---- load the evaluation summary template.
    let evaluationSummaryTemplate: string = EvaluationSummaryTemplateHtml.html;
    // ---- NOTE ---- generate label statistics.
    const labelsUtterancesMap: { [id: string]: string[] } = Utility.reverseUniqueKeyedArray(utterancesLabelsMap);
    const labelsStatistics: string[][] = Object.entries(labelsUtterancesMap).map(
      (x: [string, string[]], index: number) => [index.toString(), x[0], labelArrayAndMap.stringMap[x[0]].toString(), x[1].length.toString()]);
    const labelsStatisticTotal: number = Object.entries(labelsUtterancesMap).reduce(
      (accumulant: number, x: [string, string[]]) => accumulant + x[1].length, 0);
    labelsStatistics.push(['Total', '', '', labelsStatisticTotal.toString()]);
    const labelsStatisticsHtml: string = Utility.convertDataArraysToHtmlTable(
      'Intent statistics',
      labelsStatistics,
      ['No', 'Intent', 'Intent Index', 'Utterance Count']);
    // ---- NOTE ---- generate utterance statistics
    const utterancesStatisticsMap: {[id: number]: number} = Object.entries(utterancesLabelsMap).map(
      (x: [string, string[]]) => [1, x[1].length]).reduce(
      (accumulant: {[id: number]: number}, entry: number[]) => {
        const count: number = entry[0];
        const key: number = entry[1];
        if (key in accumulant) {
          accumulant[key] += count;
        } else {
          accumulant[key] = count;
        }
        return accumulant;
      }, {});
    const utterancesStatisticsArrays: any[][] = [...Object.entries(utterancesStatisticsMap)].sort(
      (n1: [string, number], n2: [string, number]) => {
        if (n1[1] > n2[1]) {
          return -1;
        }
        if (n1[1] < n2[1]) {
          return 1;
        }
        return 0;
      });
    const utterancesStatisticsHtml: string = Utility.convertDataArraysToHtmlTable(
      'Utterance statistics',
      utterancesStatisticsArrays,
      ['# Multi-Labels', 'Utterance Count']);
    // ---- NOTE ---- create the evaluation INTENTUTTERANCESTATISTICS summary from template.
    const intentsUtterancesStatisticsHtml: string =
      labelsStatisticsHtml + utterancesStatisticsHtml;
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{INTENTUTTERANCESTATISTICS}', intentsUtterancesStatisticsHtml);
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
    // ---- NOTE ---- collect utterance prediction and scores.
    const scoreStructureArray: {
      'utterance': string;
      'labelsPredictedEvaluation': number; // ---- 0: TP, 1, FN, 2: FP, 3: TN
      'labels': string[];
      'labelsPredicted': string[];
      'labelsPredictedScore': number;
      'labelsPredictedIndexes': number[];
      'scoreResultArray': {
        'label': string;
        'score': number;
        'closest_text': string;
        'label_type': number;
        'label_span_offset': number;
        'label_span_length': number; }[];
    }[] = [];
    for (const utteranceLabels of Object.entries(utterancesLabelsMap)) {
      if (utteranceLabels) {
        const utterance: string = utteranceLabels[0];
        const labels: string[] = utteranceLabels[1];
        const scoreresults: any = labelResolver.score(utterance);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`OrchestratorTest.runAsync(), scoreresults=${JSON.stringify(scoreresults)}`);
        }
        const scoreResultArray: {
          'label': string;
          'score': number;
          'closest_text': string;
          'label_type': number;
          'label_span_offset': number;
          'label_span_length': number; }[] = Utility.scoreResultsToArray(scoreresults, labelArrayAndMap.stringMap);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(scoreResultArray)=${JSON.stringify(scoreResultArray)}`);
        }
        const scoreArray: number[] = scoreResultArray.map((x: {
          'label': string;
          'score': number;
          'closest_text': string;
          'label_type': number;
          'label_span_offset': number;
          'label_span_length': number; }) => x.score);
        const argMax: { 'indexesMax': number[]; 'max': number } = Utility.getIndexesOnMaxEntries(scoreArray);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(argMax.indexesMax)=${JSON.stringify(argMax.indexesMax)}`);
        }
        const labelsPredictedScore: number = argMax.max;
        const labelsPredictedIndexes: number[] = argMax.indexesMax;
        const labelsPredicted: string[] = labelsPredictedIndexes.map((x: number) => labelArrayAndMap.stringArray[x]);
        const labelsPredictedEvaluation: number = Utility.evaluateMultiLabelPrediction(labels, labelsPredicted);
        scoreStructureArray.push({utterance, labelsPredictedEvaluation, labels, labelsPredicted, labelsPredictedScore, labelsPredictedIndexes, scoreResultArray});
        // ---- NOTE ---- debugging ouput.
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          for (const result of scoreresults) {
            // eslint-disable-next-line max-depth
            if (result) {
              Utility.debuggingLog(`OrchestratorTest.runAsync(), result=${JSON.stringify(result)}`);
              const closest_text: string = result.closest_text;
              const score: number = result.score;
              const label: any = result.label;
              const label_name: string = label.name;
              const label_type: any = label.label_type;
              const span: any = label.span;
              const offset: number = span.offset;
              const length: number = span.length;
              Utility.debuggingLog(`OrchestratorTest.runAsync(), closest_text=${closest_text}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), score=${score}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(label)=${JSON.stringify(label)}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), Object.keys(label)=${Object.keys(label)}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), label.name=${label_name}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), label.label_type=${label_type}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(span)=${JSON.stringify(span)}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), Object.keys(span)=${Object.keys(span)}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), label.span.offset=${offset}`);
              Utility.debuggingLog(`OrchestratorTest.runAsync(), label.span.length=${length}`);
            }
          }
        }
      }
    }
    // ---- NOTE ---- generate ambiguous HTML.
    const testingSetScoreOutputLinesAmbiguous: string[][] = [];
    for (const scoreStructure of scoreStructureArray.filter((x: {
      'utterance': string;
      'labelsPredictedEvaluation': number; // ---- 0: TP, 1, FN, 2: FP, 3: TN
      'labels': string[];
      'labelsPredicted': string[];
      'labelsPredictedScore': number;
      'labelsPredictedIndexes': number[];
      'scoreResultArray': {
        'label': string;
        'score': number;
        'closest_text': string;
        'label_type': number;
        'label_span_offset': number;
        'label_span_length': number; }[];
    }) => ((x.labelsPredictedEvaluation === 0) || (x.labelsPredictedEvaluation === 3)))) {
      if (scoreStructure) {
        const predictedScore: number = scoreStructure.labelsPredictedScore;
        const scoreArray: number[] = scoreStructure.scoreResultArray.map((x: {
          'label': string;
          'score': number;
          'closest_text': string;
          'label_type': number;
          'label_span_offset': number;
          'label_span_length': number; }) => x.score);
        const scoreArrayAmbiguous: [string, number][] = scoreArray.map(
          (x: number, index: number) => [x, index, Math.abs((predictedScore - x) / predictedScore)]).filter(
          (x: number[]) => ((x[2] < 0.2) && (x[2] > 0))).map(
          (x: number[]) => [labelArrayAndMap.stringArray[x[1]], x[0]]);
        if (scoreArrayAmbiguous.length > scoreStructure.labelsPredicted.length) {
          const labelPredictedConcatenated: string = scoreStructure.labelsPredicted.join(',');
          const labelConcatenated: string = scoreStructure.labels.join(',');
          const labelsPredictedScore: number = scoreStructure.labelsPredictedScore;
          const scoreArrayAmbiguousConcatenated: string = scoreArrayAmbiguous.map(
            (x: [string, number]) => x[0] + '=' + x[1]).join(',');
          const scoreOutputLine: any[] = [scoreStructure.utterance, labelConcatenated, labelPredictedConcatenated, labelsPredictedScore, scoreArrayAmbiguousConcatenated];
          testingSetScoreOutputLinesAmbiguous.push(scoreOutputLine);
        }
      }
    }
    const utterancesAmbiguousArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Low confidence utterances and their intents',
      testingSetScoreOutputLinesAmbiguous,
      ['Utterance', 'Intents', 'Predicted Intents', 'Prediction Score', 'Close Prediction Intent and Score']);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{AMBIGUOUS}', utterancesAmbiguousArraysHtml);
    // ---- NOTE ---- generate misclassified HTML.
    const testingSetScoreOutputLinesMisclassified: string[][] = [];
    for (const scoreStructure of scoreStructureArray.filter((x: {
      'utterance': string;
      'labelsPredictedEvaluation': number; // ---- 0: TP, 1, FN, 2: FP, 3: TN
      'labels': string[];
      'labelsPredicted': string[];
      'labelsPredictedScore': number;
      'labelsPredictedIndexes': number[];
      'scoreResultArray': {
        'label': string;
        'score': number;
        'closest_text': string;
        'label_type': number;
        'label_span_offset': number;
        'label_span_length': number; }[];
    }) => (x.labelsPredictedEvaluation === 1) || (x.labelsPredictedEvaluation === 2))) {
      if (scoreStructure) {
        const labelPredictedConcatenated: string = scoreStructure.labelsPredicted.join(',');
        const labelConcatenated: string = scoreStructure.labels.join(',');
        const scoreOutputLine: string[] = [scoreStructure.utterance, labelConcatenated, labelPredictedConcatenated];
        testingSetScoreOutputLinesMisclassified.push(scoreOutputLine);
      }
    }
    const utterancesMisclassifiedArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Misclassified utterances and their intents',
      testingSetScoreOutputLinesMisclassified,
      ['Utterance', 'Intents', 'Predicted Intents']);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{MISCLASSIFICATION}', utterancesMisclassifiedArraysHtml);
    // ---- NOTE ---- generate low-confidence HTML.
    const testingSetScoreOutputLinesLowConfidence: string[][] = [];
    for (const scoreStructure of scoreStructureArray.filter((x: {
      'utterance': string;
      'labelsPredictedEvaluation': number; // ---- 0: TP, 1, FN, 2: FP, 3: TN
      'labels': string[];
      'labelsPredicted': string[];
      'labelsPredictedScore': number;
      'labelsPredictedIndexes': number[];
      'scoreResultArray': {
        'label': string;
        'score': number;
        'closest_text': string;
        'label_type': number;
        'label_span_offset': number;
        'label_span_length': number; }[];
    }) => ((x.labelsPredictedEvaluation === 0) || (x.labelsPredictedEvaluation === 3)) && (x.labelsPredictedScore < 0.5))) {
      if (scoreStructure) {
        const labelPredictedConcatenated: string = scoreStructure.labelsPredicted.join(',');
        const labelConcatenated: string = scoreStructure.labels.join(',');
        const labelsPredictedScore: number = scoreStructure.labelsPredictedScore;
        const scoreOutputLine: any[] = [scoreStructure.utterance, labelConcatenated, labelPredictedConcatenated, labelsPredictedScore];
        testingSetScoreOutputLinesLowConfidence.push(scoreOutputLine);
      }
    }
    const utterancesLowConfidenceArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Low confidence utterances and their intents',
      testingSetScoreOutputLinesLowConfidence,
      ['Utterance', 'Intents', 'Predicted Intents', 'Prediction Score']);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{LOWCONFIDENCE}', utterancesLowConfidenceArraysHtml);
    // ---- NOTE ---- produce a score TSV file.
    const testingSetScoreOutputLines: string[][] = [];
    for (const scoreStructure of scoreStructureArray) {
      if (scoreStructure) {
        const scoreArray: number[] = scoreStructure.scoreResultArray.map((x: {
          'label': string;
          'score': number;
          'closest_text': string;
          'label_type': number;
          'label_span_offset': number;
          'label_span_length': number; }) => x.score);
        const labelPredictedConcatenated: string = scoreStructure.labelsPredicted.join(',');
        const labelConcatenated: string = scoreStructure.labels.join(',');
        const scoreArrayConcatenated: string = scoreArray.join('\t');
        const scoreOutputLine: string[] = [scoreStructure.utterance, labelConcatenated, labelPredictedConcatenated, scoreArrayConcatenated];
        testingSetScoreOutputLines.push(scoreOutputLine);
      }
    }
    Utility.storeDataArraysToTsvFile(
      testingSetScoreOutputFile,
      testingSetScoreOutputLines);
    // ---- NOTE ---- produce the evaluation summary file.
    Utility.dumpFile(testingSetSummaryOutputFile, evaluationSummaryTemplate);
    // ---- NOTE ---- the end
    Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labelArrayAndMap.stringArray)=${JSON.stringify(labelArrayAndMap.stringArray)}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labelArrayAndMap.stringMap)=${JSON.stringify(labelArrayAndMap.stringMap)}`);
    const labels: any = labelResolver.getLabels();
    Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(labels)=${JSON.stringify(labels)}`);
  }
}
