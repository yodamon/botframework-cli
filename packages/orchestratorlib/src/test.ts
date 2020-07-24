/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

import {BinaryConfusionMatrix} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/BinaryConfusionMatrix';
import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/MultiLabelConfusionMatrix';
import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/MultiLabelConfusionMatrixSubset';

import {LabelType} from './label-type';
import {Result} from './result';
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
    const scoreStructureArray: ScoreStructure[] = [];
    for (const utteranceLabels of Object.entries(utterancesLabelsMap)) {
      if (utteranceLabels) {
        const utterance: string = utteranceLabels[0];
        if (Utility.isEmptyString(utterance)) {
          continue;
        }
        const labels: string[] = utteranceLabels[1];
        const labelsIndexes: number[] = labels.map((x: string) => labelArrayAndMap.stringMap[x]);
        const labelsConcatenated: string = labels.join(',');
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`OrchestratorTest.runAsync(), before calling score(), utterance=${utterance}`);
        }
        const scoreResults: any = labelResolver.score(utterance, LabelType.Intent);
        if (!scoreResults) {
          continue;
        }
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`OrchestratorTest.runAsync(), scoreResults=${JSON.stringify(scoreResults)}`);
        }
        const scoreResultArray: Result[] = Utility.scoreResultsToArray(scoreResults, labelArrayAndMap.stringMap);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(scoreResultArray)=${JSON.stringify(scoreResultArray)}`);
        }
        const scoreArray: number[] = scoreResultArray.map((x: Result) => x.score);
        const argMax: { 'indexesMax': number[]; 'max': number } = Utility.getIndexesOnMaxEntries(scoreArray);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(argMax.indexesMax)=${JSON.stringify(argMax.indexesMax)}`);
        }
        const labelsPredictedScore: number = argMax.max;
        const labelsPredictedIndexes: number[] = argMax.indexesMax;
        const labelsPredicted: string[] = labelsPredictedIndexes.map((x: number) => scoreResultArray[x].label.name);
        const labelsPredictedConcatenated: string = labelsPredicted.join(',');
        const labelsPredictedEvaluation: number = Utility.evaluateMultiLabelPrediction(labels, labelsPredicted);
        const labelsPredictedClosestText: string[] = labelsPredictedIndexes.map((x: number) => scoreResultArray[x].closest_text);
        const predictedScoreStructureHtmlTable: string = Utility.selectedScoreResultsToHtmlTable(
          scoreResultArray,
          labelsPredictedIndexes,
          '',
          ['Label', 'Score', 'Closest Example'],
          ['30%', '10%', '60%']);
        const labelsScoreStructureHtmlTable: string = Utility.selectedScoreResultsToHtmlTable(
          scoreResultArray,
          labels.map((x: string) => labelArrayAndMap.stringMap[x]),
          '',
          ['Label', 'Score', 'Closest Example'],
          ['30%', '10%', '60%']);
        scoreStructureArray.push(new ScoreStructure(
          utterance,
          labelsPredictedEvaluation,
          labels,
          labelsConcatenated,
          labelsIndexes,
          labelsPredicted,
          labelsPredictedConcatenated,
          labelsPredictedScore,
          labelsPredictedIndexes,
          labelsPredictedClosestText,
          scoreResultArray,
          scoreArray,
          predictedScoreStructureHtmlTable,
          labelsScoreStructureHtmlTable));
        // ---- NOTE ---- debugging ouput.
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          for (const result of scoreResults) {
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
    const scoreOutputLinesAmbiguous: string[][] = [];
    for (const scoreStructure of scoreStructureArray.filter((x: ScoreStructure) => ((x.labelsPredictedEvaluation === 0) || (x.labelsPredictedEvaluation === 3)))) {
      if (scoreStructure) {
        const predictedScore: number = scoreStructure.labelsPredictedScore;
        const scoreArray: number[] = scoreStructure.scoreArray;
        const scoreArrayAmbiguous: number[][] = scoreArray.map(
          (x: number, index: number) => [x, index, Math.abs((predictedScore - x) / predictedScore)]).filter(
          (x: number[]) => ((x[2] < 0.2) && (x[2] > 0))).map(
          (x: number[]) => [x[1], x[0], x[2]]);
        if (scoreArrayAmbiguous.length > 0) {
          const labelsScoreStructureHtmlTable: string = scoreStructure.labelsScoreStructureHtmlTable;
          const labelsPredictedConcatenated: string = scoreStructure.labelsPredictedConcatenated;
          const ambiguousScoreStructureHtmlTable: string = Utility.selectedScoreStructureToHtmlTable(
            scoreStructure,
            '',
            ['Label', 'Score', 'Closest Example'],
            ['30%', '10%', '60%'],
            scoreArrayAmbiguous.map((x: number[]) => x[0]));
          const scoreOutputLine: any[] = [
            scoreStructure.utterance,
            labelsScoreStructureHtmlTable,
            labelsPredictedConcatenated,
            ambiguousScoreStructureHtmlTable,
          ];
          scoreOutputLinesAmbiguous.push(scoreOutputLine);
        }
      }
    }
    const utterancesAmbiguousArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Ambiguous utterances and their intents',
      scoreOutputLinesAmbiguous,
      ['Utterance', 'Intents', 'Predictions', 'Close Predictions']);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{AMBIGUOUS}', utterancesAmbiguousArraysHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {AMBIGUOUS} content');

    // ---- NOTE ---- generate misclassified HTML.
    const scoreOutputLinesMisclassified: string[][] = [];
    for (const scoreStructure of scoreStructureArray.filter((x: ScoreStructure) => (x.labelsPredictedEvaluation === 1) || (x.labelsPredictedEvaluation === 2))) {
      if (scoreStructure) {
        const labelsScoreStructureHtmlTable: string = scoreStructure.labelsScoreStructureHtmlTable;
        const predictedScoreStructureHtmlTable: string = scoreStructure.predictedScoreStructureHtmlTable;
        const scoreOutputLine: string[] = [
          scoreStructure.utterance,
          labelsScoreStructureHtmlTable,
          predictedScoreStructureHtmlTable,
        ];
        scoreOutputLinesMisclassified.push(scoreOutputLine);
      }
    }
    const utterancesMisclassifiedArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Misclassified utterances and their intents',
      scoreOutputLinesMisclassified,
      ['Utterance', 'Intents', 'Predictions']);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{MISCLASSIFICATION}', utterancesMisclassifiedArraysHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {MISCLASSIFICATION} content');

    // ---- NOTE ---- generate low-confidence HTML.
    const scoreOutputLinesLowConfidence: string[][] = [];
    for (const scoreStructure of scoreStructureArray.filter((x: ScoreStructure) => ((x.labelsPredictedEvaluation === 0) || (x.labelsPredictedEvaluation === 3)) && (x.labelsPredictedScore < 0.5))) {
      if (scoreStructure) {
        const labelsScoreStructureHtmlTable: string = scoreStructure.labelsScoreStructureHtmlTable;
        const labelsPredictedConcatenated: string = scoreStructure.labelsPredictedConcatenated;
        const scoreOutputLine: any[] = [
          scoreStructure.utterance,
          labelsScoreStructureHtmlTable,
          labelsPredictedConcatenated,
        ];
        scoreOutputLinesLowConfidence.push(scoreOutputLine);
      }
    }
    const utterancesLowConfidenceArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Low confidence utterances and their intents',
      scoreOutputLinesLowConfidence,
      ['Utterance', 'Intents', 'Predictions']);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{LOWCONFIDENCE}', utterancesLowConfidenceArraysHtml);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {LOWCONFIDENCE} content');

    // ---- NOTE ---- produce confusion matrix result.
    const scoreOutputLinesConfusionMatrix: string[][] = [];
    const confusionMatrix: MultiLabelConfusionMatrix = new MultiLabelConfusionMatrix(
      labelArrayAndMap.stringArray,
      labelArrayAndMap.stringMap);
    const multiLabelConfusionMatrixSubset: MultiLabelConfusionMatrixSubset = new MultiLabelConfusionMatrixSubset(
      labelArrayAndMap.stringArray,
      labelArrayAndMap.stringMap);
    for (const scoreStructure of scoreStructureArray) {
      if (scoreStructure) {
        confusionMatrix.addInstanceByLabelIndexes(scoreStructure.labelsIndexes, scoreStructure.labelsPredictedIndexes);
        multiLabelConfusionMatrixSubset.addInstanceByLabelIndexes(scoreStructure.labelsIndexes, scoreStructure.labelsPredictedIndexes);
      }
    }
    const binaryConfusionMatrices: BinaryConfusionMatrix[] = confusionMatrix.getBinaryConfusionMatrices();
    Utility.debuggingLog(`OrchestratorTest.runAsync(), binaryConfusionMatrices.length=${binaryConfusionMatrices.length}`);
    for (let i: number = 0; i < binaryConfusionMatrices.length; i++) {
      const label: string = labelArrayAndMap.stringArray[i];
      const precision: number = Utility.round(binaryConfusionMatrices[i].getPrecision());
      const recall: number = Utility.round(binaryConfusionMatrices[i].getRecall());
      const f1: number = Utility.round(binaryConfusionMatrices[i].getF1Measure());
      const truePositives: number = binaryConfusionMatrices[i].getTruePositives();
      const falsePositives: number = binaryConfusionMatrices[i].getFalsePositives();
      const trueNegatives: number = binaryConfusionMatrices[i].getTrueNegatives();
      const falseNegatives: number = binaryConfusionMatrices[i].getFalseNegatives();
      const total: number = binaryConfusionMatrices[i].getTotal();
      const scoreOutputLineConfusionMatrix: any[] = [
        label,
        precision,
        recall,
        f1,
        truePositives,
        falsePositives,
        trueNegatives,
        falseNegatives,
        total,
      ];
      scoreOutputLinesConfusionMatrix.push(scoreOutputLineConfusionMatrix);
      Utility.debuggingLog(`OrchestratorTest.runAsync(), binaryConfusionMatrices[${i}].getTotal()         =${binaryConfusionMatrices[i].getTotal()}`);
      Utility.debuggingLog(`OrchestratorTest.runAsync(), binaryConfusionMatrices[${i}].getTruePositives() =${binaryConfusionMatrices[i].getTruePositives()}`);
      Utility.debuggingLog(`OrchestratorTest.runAsync(), binaryConfusionMatrices[${i}].getFalsePositives()=${binaryConfusionMatrices[i].getFalsePositives()}`);
      Utility.debuggingLog(`OrchestratorTest.runAsync(), binaryConfusionMatrices[${i}].getTrueNegatives() =${binaryConfusionMatrices[i].getTrueNegatives()}`);
      Utility.debuggingLog(`OrchestratorTest.runAsync(), binaryConfusionMatrices[${i}].getFalseNegatives()=${binaryConfusionMatrices[i].getFalseNegatives()}`);
    }
    const microAverageMetrics: {
      'averagePrecisionRecallF1Accuracy': number;
      'truePositives': number;
      'total': number;
    } = confusionMatrix.getMicroAverageMetrics();
    const scoreOutputLineConfusionMatrixMicroAverage: any[] = [
      'Micro-Average',
      Utility.round(microAverageMetrics.averagePrecisionRecallF1Accuracy),
      Utility.round(microAverageMetrics.averagePrecisionRecallF1Accuracy),
      Utility.round(microAverageMetrics.averagePrecisionRecallF1Accuracy),
      microAverageMetrics.truePositives,
      microAverageMetrics.total - microAverageMetrics.truePositives,
      'N/A',
      'N/A',
      microAverageMetrics.total,
    ];
    scoreOutputLinesConfusionMatrix.push(scoreOutputLineConfusionMatrixMicroAverage);
    const confusionMatrixHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Confusion matrix metrics',
      scoreOutputLinesConfusionMatrix,
      ['Intent', 'Precision', 'Recall', 'F1', '#TruePositives', '#FalsePositives', '#TrueNegatives', '#FalseNegatives', 'Total']);
    evaluationSummaryTemplate = evaluationSummaryTemplate.replace('{MODELEVALUATION}', confusionMatrixHtml);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(confusionMatrix.getMicroAverageMetrics())=${JSON.stringify(confusionMatrix.getMicroAverageMetrics())}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(multiLabelConfusionMatrixSubset.getMicroAverageMetrics())=${JSON.stringify(multiLabelConfusionMatrixSubset.getMicroAverageMetrics())}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTotal()         =${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTotal()}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTruePositives() =${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTruePositives()}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getFalsePositives()=${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getFalsePositives()}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTrueNegatives() =${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTrueNegatives()}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getFalseNegatives()=${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getFalseNegatives()}`);
    Utility.debuggingLog('OrchestratorTest.runAsync(), finished generating {MODELEVALUATION} content');

    // ---- NOTE ---- produce a score TSV file.
    const scoreOutputLines: string[][] = [];
    for (const scoreStructure of scoreStructureArray) {
      if (scoreStructure) {
        const scoreArray: number[] = scoreStructure.scoreResultArray.map((x: Result) => x.score);
        const labelConcatenated: string = scoreStructure.labels.join(',');
        const labelPredictedConcatenated: string = scoreStructure.labelsPredicted.join(',');
        const scoreArrayConcatenated: string = scoreArray.join('\t');
        const scoreOutputLine: string[] = [
          scoreStructure.utterance,
          labelConcatenated,
          labelPredictedConcatenated,
          scoreArrayConcatenated,
        ];
        scoreOutputLines.push(scoreOutputLine);
      }
    }
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
