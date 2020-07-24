/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as fs from 'fs';
import * as path from 'path';

import {BinaryConfusionMatrix} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/BinaryConfusionMatrix';
import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/MultiLabelConfusionMatrix';
import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher/lib/mathematics/confusion_matrix/MultiLabelConfusionMatrixSubset';

import {Example} from './example';
import {Label} from './label';
import {LabelType} from './label-type';
import {OrchestratorHelper} from './orchestratorhelper';
import {Result} from './result';
import {ScoreStructure} from './score-structure';
import {Span} from './span';

export class Utility {
  public static toPrintDebuggingLogToConsole: boolean = true;

  public static toPrintDetailedDebuggingLogToConsole: boolean = false;

  public static generateScoreOutputLines(
    scoreStructureArray: ScoreStructure[]): string[][] {
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
    return scoreOutputLines;
  }

  public static generateConfusionMatrixMetricsAndHtmlTable(
    scoreStructureArray: ScoreStructure[],
    labelArrayAndMap: {
      'stringArray': string[];
      'stringMap': {[id: string]: number};}): {
      'confusionMatrix': MultiLabelConfusionMatrix;
      'multiLabelConfusionMatrixSubset': MultiLabelConfusionMatrixSubset;
      'scoreOutputLinesConfusionMatrix': string[][];
      'confusionMatrixHtml': string;
    } {
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
    Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), binaryConfusionMatrices.length=${binaryConfusionMatrices.length}`);
    for (let i: number = 0; i < binaryConfusionMatrices.length; i++) {
      const label: string = labelArrayAndMap.stringArray[i];
      const precision: number = Utility.round(binaryConfusionMatrices[i].getPrecision());
      const recall: number = Utility.round(binaryConfusionMatrices[i].getRecall());
      const f1: number = Utility.round(binaryConfusionMatrices[i].getF1Measure());
      const accuracy: number = Utility.round(binaryConfusionMatrices[i].getAccuracy());
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
        accuracy,
        truePositives,
        falsePositives,
        trueNegatives,
        falseNegatives,
        total,
      ];
      scoreOutputLinesConfusionMatrix.push(scoreOutputLineConfusionMatrix);
      Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), binaryConfusionMatrices[${i}].getTotal()         =${binaryConfusionMatrices[i].getTotal()}`);
      Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), binaryConfusionMatrices[${i}].getTruePositives() =${binaryConfusionMatrices[i].getTruePositives()}`);
      Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), binaryConfusionMatrices[${i}].getFalsePositives()=${binaryConfusionMatrices[i].getFalsePositives()}`);
      Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), binaryConfusionMatrices[${i}].getTrueNegatives() =${binaryConfusionMatrices[i].getTrueNegatives()}`);
      Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), binaryConfusionMatrices[${i}].getFalseNegatives()=${binaryConfusionMatrices[i].getFalseNegatives()}`);
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
      Utility.round(microAverageMetrics.averagePrecisionRecallF1Accuracy),
      microAverageMetrics.truePositives,
      'N/A',
      'N/A',
      'N/A',
      microAverageMetrics.total,
    ];
    scoreOutputLinesConfusionMatrix.push(scoreOutputLineConfusionMatrixMicroAverage);
    const confusionMatrixHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Confusion matrix metrics',
      scoreOutputLinesConfusionMatrix,
      ['Intent', 'Precision', 'Recall', 'F1', 'Accuracy', '#TruePositives', '#FalsePositives', '#TrueNegatives', '#FalseNegatives', 'Total']);
    Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), JSON.stringify(confusionMatrix.getMicroAverageMetrics())=${JSON.stringify(confusionMatrix.getMicroAverageMetrics())}`);
    Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), JSON.stringify(multiLabelConfusionMatrixSubset.getMicroAverageMetrics())=${JSON.stringify(multiLabelConfusionMatrixSubset.getMicroAverageMetrics())}`);
    Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTotal()         =${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTotal()}`);
    Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTruePositives() =${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTruePositives()}`);
    Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getFalsePositives()=${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getFalsePositives()}`);
    Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTrueNegatives() =${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getTrueNegatives()}`);
    Utility.debuggingLog(`Utility.generateConfusionMatrixMetricsAndHtmlTable(), multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getFalseNegatives()=${multiLabelConfusionMatrixSubset.getBinaryConfusionMatrix().getFalseNegatives()}`);
    Utility.debuggingLog('Utility.generateConfusionMatrixMetricsAndHtmlTable(), finished generating {MODELEVALUATION} content');
    return {confusionMatrix, multiLabelConfusionMatrixSubset, scoreOutputLinesConfusionMatrix, confusionMatrixHtml};
  }

  public static generateLowConfidenceStatisticsAndHtmlTable(
    scoreStructureArray: ScoreStructure[]): {
      'scoringLowConfidenceOutputLines': string[][];
      'scoringLowConfidenceUtterancesArraysHtml': string;
    } {
    const scoringLowConfidenceOutputLines: string[][] = [];
    for (const scoreStructure of scoreStructureArray.filter((x: ScoreStructure) => ((x.labelsPredictedEvaluation === 0) || (x.labelsPredictedEvaluation === 3)) && (x.labelsPredictedScore < 0.5))) {
      if (scoreStructure) {
        const labelsScoreStructureHtmlTable: string = scoreStructure.labelsScoreStructureHtmlTable;
        const labelsPredictedConcatenated: string = scoreStructure.labelsPredictedConcatenated;
        const scoreOutputLine: any[] = [
          scoreStructure.utterance,
          labelsScoreStructureHtmlTable,
          labelsPredictedConcatenated,
        ];
        scoringLowConfidenceOutputLines.push(scoreOutputLine);
      }
    }
    const scoringLowConfidenceUtterancesArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Low confidence utterances and their intents',
      scoringLowConfidenceOutputLines,
      ['Utterance', 'Intents', 'Predictions']);
    return {scoringLowConfidenceOutputLines, scoringLowConfidenceUtterancesArraysHtml};
  }

  public static generateMisclassifiedStatisticsAndHtmlTable(
    scoreStructureArray: ScoreStructure[]): {
      'scoringMisclassifiedOutputLines': string[][];
      'scoringMisclassifiedUtterancesArraysHtml': string;
    } {
    const scoringMisclassifiedOutputLines: string[][] = [];
    for (const scoreStructure of scoreStructureArray.filter((x: ScoreStructure) => (x.labelsPredictedEvaluation === 1) || (x.labelsPredictedEvaluation === 2))) {
      if (scoreStructure) {
        const labelsScoreStructureHtmlTable: string = scoreStructure.labelsScoreStructureHtmlTable;
        const predictedScoreStructureHtmlTable: string = scoreStructure.predictedScoreStructureHtmlTable;
        const scoreOutputLine: string[] = [
          scoreStructure.utterance,
          labelsScoreStructureHtmlTable,
          predictedScoreStructureHtmlTable,
        ];
        scoringMisclassifiedOutputLines.push(scoreOutputLine);
      }
    }
    const scoringMisclassifiedUtterancesArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Misclassified utterances and their intents',
      scoringMisclassifiedOutputLines,
      ['Utterance', 'Intents', 'Predictions']);
    return {scoringMisclassifiedOutputLines, scoringMisclassifiedUtterancesArraysHtml};
  }

  public static generateAmbiguousStatisticsAndHtmlTable(
    scoreStructureArray: ScoreStructure[]): {
      'scoringAmbiguousOutputLines': string[][];
      'scoringAmbiguousUtterancesArraysHtml': string;
    } {
    const scoringAmbiguousOutputLines: string[][] = [];
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
          const scoringAmbiguousOutputLine: any[] = [
            scoreStructure.utterance,
            labelsScoreStructureHtmlTable,
            labelsPredictedConcatenated,
            ambiguousScoreStructureHtmlTable,
          ];
          scoringAmbiguousOutputLines.push(scoringAmbiguousOutputLine);
        }
      }
    }
    const scoringAmbiguousUtterancesArraysHtml: string = Utility.convertDataArraysToIndexedHtmlTable(
      'Ambiguous utterances and their intents',
      scoringAmbiguousOutputLines,
      ['Utterance', 'Intents', 'Predictions', 'Close Predictions']);
    return {scoringAmbiguousOutputLines, scoringAmbiguousUtterancesArraysHtml};
  }

  public static score(
    labelResolver: any,
    utteranceLabelsPairArray: [string, string[]][],
    labelArrayAndMap: {
      'stringArray': string[];
      'stringMap': {[id: string]: number};}): ScoreStructure[] {
    const scoreStructureArray: ScoreStructure[] = [];
    for (const utteranceLabels of utteranceLabelsPairArray) {
      if (utteranceLabels) {
        const utterance: string = utteranceLabels[0];
        if (Utility.isEmptyString(utterance)) {
          continue;
        }
        const labels: string[] = utteranceLabels[1];
        const labelsIndexes: number[] = labels.map((x: string) => labelArrayAndMap.stringMap[x]);
        const labelsConcatenated: string = labels.join(',');
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`Utility.score(), before calling score(), utterance=${utterance}`);
        }
        const scoreResults: any = labelResolver.score(utterance, LabelType.Intent);
        if (!scoreResults) {
          continue;
        }
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`Utility.score(), scoreResults=${JSON.stringify(scoreResults)}`);
        }
        const scoreResultArray: Result[] = Utility.scoreResultsToArray(scoreResults, labelArrayAndMap.stringMap);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`Utility.score(), JSON.stringify(scoreResultArray)=${JSON.stringify(scoreResultArray)}`);
        }
        const scoreArray: number[] = scoreResultArray.map((x: Result) => x.score);
        const argMax: { 'indexesMax': number[]; 'max': number } = Utility.getIndexesOnMaxEntries(scoreArray);
        if (Utility.toPrintDetailedDebuggingLogToConsole) {
          Utility.debuggingLog(`Utility.score(), JSON.stringify(argMax.indexesMax)=${JSON.stringify(argMax.indexesMax)}`);
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
              Utility.debuggingLog(`Utility.score(), result=${JSON.stringify(result)}`);
              const closest_text: string = result.closest_text;
              const score: number = result.score;
              const label: any = result.label;
              const label_name: string = label.name;
              const label_type: any = label.label_type;
              const span: any = label.span;
              const offset: number = span.offset;
              const length: number = span.length;
              Utility.debuggingLog(`Utility.score(), closest_text=${closest_text}`);
              Utility.debuggingLog(`Utility.score(), score=${score}`);
              Utility.debuggingLog(`Utility.score(), JSON.stringify(label)=${JSON.stringify(label)}`);
              Utility.debuggingLog(`Utility.score(), Object.keys(label)=${Object.keys(label)}`);
              Utility.debuggingLog(`Utility.score(), label.name=${label_name}`);
              Utility.debuggingLog(`Utility.score(), label.label_type=${label_type}`);
              Utility.debuggingLog(`Utility.score(), JSON.stringify(span)=${JSON.stringify(span)}`);
              Utility.debuggingLog(`Utility.score(), Object.keys(span)=${Object.keys(span)}`);
              Utility.debuggingLog(`Utility.score(), label.span.offset=${offset}`);
              Utility.debuggingLog(`Utility.score(), label.span.length=${length}`);
            }
          }
        }
      }
    }
    return scoreStructureArray;
  }

  public static generateUtteranceStatisticsAndHtmlTable(
    utterancesLabelsMap: { [id: string]: string[] }): {
        'utteranceStatistics': string[][];
        'utteranceStatisticsHtml': string;
      } {
    const utteranceStatisticsMap: {[id: number]: number} = Object.entries(utterancesLabelsMap).map(
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
    const utteranceStatistics: any[][] = [...Object.entries(utteranceStatisticsMap)].sort(
      (n1: [string, number], n2: [string, number]) => {
        if (n1[1] > n2[1]) {
          return -1;
        }
        if (n1[1] < n2[1]) {
          return 1;
        }
        return 0;
      });
    const utteranceStatisticsHtml: string = Utility.convertDataArraysToHtmlTable(
      'Utterance statistics',
      utteranceStatistics,
      ['# Multi-Labels', 'Utterance Count']);
    return {utteranceStatistics, utteranceStatisticsHtml};
  }

  public static generateLabelStatisticsAndHtmlTable(
    utterancesLabelsMap: { [id: string]: string[] },
    labelArrayAndMap: {
      'stringArray': string[];
      'stringMap': {[id: string]: number};}): {
        'labelStatistics': string[][];
        'labelStatisticsHtml': string;
      } {
    // ---- NOTE ---- generate label statistics.
    const labelsUtterancesMap: { [id: string]: string[] } = Utility.reverseUniqueKeyedArray(utterancesLabelsMap);
    const labelStatistics: string[][] = Object.entries(labelsUtterancesMap).sort(
      (n1: [string, string[]], n2: [string, string[]]) => {
        if (n1[0] > n2[0]) {
          return 1;
        }
        if (n1[0] < n2[0]) {
          return -1;
        }
        return 0;
      }).map(
      (x: [string, string[]], index: number) => [index.toString(), x[0], labelArrayAndMap.stringMap[x[0]].toString(), x[1].length.toString()]);
    const labelsStatisticTotal: number = Object.entries(labelsUtterancesMap).reduce(
      (accumulant: number, x: [string, string[]]) => accumulant + x[1].length, 0);
    labelStatistics.push(['Total', '', '', labelsStatisticTotal.toString()]);
    const labelStatisticsHtml: string = Utility.convertDataArraysToHtmlTable(
      'Intent statistics',
      labelStatistics,
      ['No', 'Intent', 'Intent Index', 'Utterance Count']);
    return {labelStatistics, labelStatisticsHtml};
  }

  // eslint-disable-next-line max-params
  public static selectedScoreStructureToHtmlTable(
    scoreStructure: ScoreStructure,
    tableDescription: string = '',
    selectedOutputDataArraryHeaders: string[] = [],
    outputDataColumnWidthSettings: string[] = [],
    indexes: number[] = []): string {
    if (Utility.isEmptyNumberArray(indexes)) {
      indexes = scoreStructure.labelsPredictedIndexes;
    }
    return Utility.selectedScoreResultsToHtmlTable(
      scoreStructure.scoreResultArray,
      indexes,
      tableDescription,
      selectedOutputDataArraryHeaders,
      outputDataColumnWidthSettings);
  }

  // eslint-disable-next-line max-params
  public static selectedScoreResultsToHtmlTable(
    scoreResultArray: Result[],
    indexes: number[],
    tableDescription: string = '',
    selectedOutputDataArraryHeaders: string[] = [],
    outputDataColumnWidthSettings: string[] = []): string {
    const labelsSelectedArrays: any[][] = indexes.map((x: number) => [scoreResultArray[x].label.name, scoreResultArray[x].score, scoreResultArray[x].closest_text]);
    const selectedScoreStructureHtmlTable: string = Utility.convertDataArraysToHtmlTable(
      tableDescription,
      labelsSelectedArrays,
      selectedOutputDataArraryHeaders,
      outputDataColumnWidthSettings);
    return selectedScoreStructureHtmlTable;
  }

  public static evaluateMultiLabelPrediction(groundTruths: any[], predictions: any[]): number {
    if (predictions.length <= 0) {
      if (groundTruths.length <= 0) {
        return 3; // ---- NOTE ---- 3 for true negative as there is no prediction on an empty ground-truth set.
      }
      return 1; // ---- NOTE ---- 1 for false negative as there is no prediction on a non-empty ground-truth set.
    }
    for (const prediction of predictions) {
      if (!groundTruths.includes(prediction)) {
        return 2; // ---- NOTE ---- 2 for false positive as there is a prediction not in the ground-truth set.
      }
    }
    return 0; // ---- NOTE ---- 0 for true positive as every prediction is in the ground-trueh set.
  }

  public static reverseUniqueKeyedArray(input: {[id: string]: string[]}): {[id: string]: string[]} {
    const reversed: {[id: string]: string[]} = {};
    for (const key in input) {
      if (key) {
        const keyedArray: string[] = input[key];
        for (const keyedArrayElement of keyedArray) {
          if (keyedArrayElement in reversed) {
            reversed[keyedArrayElement].push(key);
          } else {
            reversed[keyedArrayElement] = [key];
          }
        }
      }
    }
    return reversed;
  }

  // eslint-disable-next-line max-params
  public static storeDataArraysToTsvFile(
    outputFilename: string,
    outputEvaluationReportDataArrays: string[][],
    outputDataArraryHeaders: string[] = [],
    columnDelimiter: string = '\t',
    recordDelimiter: string = '\n',
    encoding: string = 'utf8'): string {
    if (Utility.isEmptyString(outputFilename)) {
      Utility.debuggingThrow(
        'outputFilename is empty');
    }
    if (Utility.isEmptyStringArrays(outputEvaluationReportDataArrays)) {
      Utility.debuggingThrow(
        'outputEvaluationReportDataArrays is empty');
    }
    const outputLines: string[] = [];
    if (!Utility.isEmptyStringArray(outputDataArraryHeaders)) {
      const outputLine: string = outputDataArraryHeaders.join(columnDelimiter);
      outputLines.push(outputLine);
    }
    for (const outputEvaluationReportDataArray of outputEvaluationReportDataArrays) {
      const outputLine: string = outputEvaluationReportDataArray.join(columnDelimiter);
      outputLines.push(outputLine);
    }
    const outputContent: string = outputLines.join(recordDelimiter);
    try {
      return Utility.dumpFile(outputFilename, `${outputContent}${recordDelimiter}`, encoding);
    } catch (error) {
      Utility.debuggingThrow(
        `storeTsvFile() cannout create an output file: ${outputFilename}, EXCEPTION=${error}`);
      return '';
    }
  }

  // eslint-disable-next-line max-params
  public static convertDataArraysToHtmlTable(
    tableDescription: string,
    outputEvaluationReportDataArrays: any[][],
    outputDataArraryHeaders: string[] = [],
    outputDataColumnWidthSettings: string[] = [],
    indentCumulative: string = '  ',
    indent: string = '  '): string {
    const outputLines: string[] = [];
    if (Utility.isEmptyStringArrays(outputEvaluationReportDataArrays)) {
      Utility.debuggingThrow(
        'outputEvaluationReportDataArrays is empty');
    }
    if (!Utility.isEmptyString(tableDescription)) {
      outputLines.push(indentCumulative + `<p><strong>${tableDescription}</strong></p>`);
    }
    outputLines.push(indentCumulative + '<table class="table">');
    if (!Utility.isEmptyStringArray(outputDataArraryHeaders)) {
      outputLines.push(indentCumulative + indent + '<tr>');
      for (let i: number = 0; i < outputDataArraryHeaders.length; i++) {
        const headerEntry: string = outputDataArraryHeaders[i];
        let widthSetting: string = '';
        if (!Utility.isEmptyStringArray(outputDataColumnWidthSettings) && (outputDataColumnWidthSettings.length > i)) {
          widthSetting = ` width=${outputDataColumnWidthSettings[i]}`;
        }
        outputLines.push(indentCumulative + indent + indent + '<th' + widthSetting + '>');
        outputLines.push(indentCumulative + indent + indent + headerEntry);
        outputLines.push(indentCumulative + indent + indent + '</th>');
      }
      outputLines.push(indentCumulative + indent + '<tr>');
    }
    for (const outputEvaluationReportDataArray of outputEvaluationReportDataArrays) {
      outputLines.push(indentCumulative + indent + '<tr>');
      for (const dataEntry of outputEvaluationReportDataArray) {
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + dataEntry);
        outputLines.push(indentCumulative + indent + indent + '</td>');
      }
      outputLines.push(indentCumulative + indent + '</tr>');
    }
    outputLines.push(indentCumulative + '</table>');
    const outputContent: string = outputLines.join('\n');
    return outputContent;
  }

  // eslint-disable-next-line max-params
  public static convertDataArraysToIndexedHtmlTable(
    tableDescription: string,
    outputEvaluationReportDataArrays: any[][],
    outputDataArraryHeaders: string[] = [],
    indentCumulative: string = '  ',
    indent: string = '  '): string {
    const outputLines: string[] = [];
    if (!Utility.isEmptyString(tableDescription)) {
      outputLines.push(indentCumulative + `<p><strong>${tableDescription}</strong></p>`);
    }
    outputLines.push(indentCumulative + '<table class="table">');
    if (!Utility.isEmptyStringArray(outputDataArraryHeaders)) {
      outputLines.push(indentCumulative + indent + '<tr>');
      outputLines.push(indentCumulative + indent + indent + '<th>');
      outputLines.push(indentCumulative + indent + indent + 'No');
      outputLines.push(indentCumulative + indent + indent + '</th>');
      for (const headerEntry of outputDataArraryHeaders) {
        outputLines.push(indentCumulative + indent + indent + '<th>');
        outputLines.push(indentCumulative + indent + indent + headerEntry);
        outputLines.push(indentCumulative + indent + indent + '</th>');
      }
      outputLines.push(indentCumulative + indent + '<tr>');
    }
    if (!Utility.isEmptyStringArrays(outputEvaluationReportDataArrays)) {
      let index: number = 0;
      for (const outputEvaluationReportDataArray of outputEvaluationReportDataArrays) {
        outputLines.push(indentCumulative + indent + '<tr>');
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + index++);
        outputLines.push(indentCumulative + indent + indent + '</td>');
        for (const dataEntry of outputEvaluationReportDataArray) {
          outputLines.push(indentCumulative + indent + indent + '<td>');
          outputLines.push(indentCumulative + indent + indent + dataEntry);
          outputLines.push(indentCumulative + indent + indent + '</td>');
        }
        outputLines.push(indentCumulative + indent + '</tr>');
      }
    }
    outputLines.push(indentCumulative + '</table>');
    const outputContent: string = outputLines.join('\n');
    return outputContent;
  }

  // eslint-disable-next-line max-params
  public static convertMapSetToIndexedHtmlTable(
    tableDescription: string,
    outputEvaluationMapSet: Map<any, Set<any>>,
    outputDataArraryHeaders: string[] = [],
    indentCumulative: string = '  ',
    indent: string = '  '): string {
    const outputLines: string[] = [];
    if (outputEvaluationMapSet === null) {
      Utility.debuggingThrow(
        'outputEvaluationMapSet is empty');
    }
    if (!Utility.isEmptyString(tableDescription)) {
      outputLines.push(indentCumulative + `<p><strong>${tableDescription}</strong></p>`);
    }
    outputLines.push(indentCumulative + '<table class="table">');
    if (!Utility.isEmptyStringArray(outputDataArraryHeaders)) {
      outputLines.push(indentCumulative + indent + '<tr>');
      outputLines.push(indentCumulative + indent + indent + '<th>');
      outputLines.push(indentCumulative + indent + indent + 'No');
      outputLines.push(indentCumulative + indent + indent + '</th>');
      for (const headerEntry of outputDataArraryHeaders) {
        outputLines.push(indentCumulative + indent + indent + '<th>');
        outputLines.push(indentCumulative + indent + indent + headerEntry);
        outputLines.push(indentCumulative + indent + indent + '</th>');
      }
      outputLines.push(indentCumulative + indent + '<tr>');
    }
    let index: number = 0;
    for (const outputEvaluationMapSetEntry of outputEvaluationMapSet) {
      const key: any = outputEvaluationMapSetEntry[0];
      for (const valueSetEntry of outputEvaluationMapSetEntry[1]) {
        outputLines.push(indentCumulative + indent + '<tr>');
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + index++);
        outputLines.push(indentCumulative + indent + indent + '</td>');
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + key);
        outputLines.push(indentCumulative + indent + indent + '</td>');
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + valueSetEntry);
        outputLines.push(indentCumulative + indent + indent + '</td>');
        outputLines.push(indentCumulative + indent + '</tr>');
      }
    }
    outputLines.push(indentCumulative + '</table>');
    const outputContent: string = outputLines.join('\n');
    return outputContent;
  }

  public static getIndexesOnMaxEntries(
    inputArray: number[]):
    { 'indexesMax': number[]; 'max': number } {
    if (Utility.isEmptyNumberArray(inputArray)) {
      Utility.debuggingThrow('inputArray is empty');
    }
    let indexesMax: number[] = [0];
    let max: number = inputArray[0];
    for (let i: number = 1; i < inputArray.length; i++) {
      const inputCurrent: number = inputArray[i];
      if (inputCurrent > max) {
        max = inputCurrent;
        indexesMax = [i];
        continue;
      }
      if (inputCurrent === max) {
        indexesMax.push(i);
      }
    }
    return {indexesMax, max};
  }

  public static getIndexOnFirstMaxEntry(
    inputArray: number[]):
    { 'indexMax': number; 'max': number } {
    if (Utility.isEmptyNumberArray(inputArray)) {
      Utility.debuggingThrow('inputArray is empty');
    }
    let indexMax: number = 0;
    let max: number = inputArray[0];
    for (let i: number = 1; i < inputArray.length; i++) {
      const inputCurrent: number = inputArray[i];
      if (inputCurrent > max) {
        max = inputCurrent;
        indexMax = i;
      }
    }
    return {indexMax, max};
  }

  public static isEmptyNumberArrays(inputArrays: number[][]): boolean {
    return !(inputArrays && inputArrays.length > 0);
  }

  public static isEmptyStringArrays(inputArrays: string[][]): boolean {
    return !(inputArrays && inputArrays.length > 0);
  }

  public static isEmptyNumberArray(inputArray: number[]): boolean {
    return !(inputArray && inputArray.length > 0);
  }

  public static isEmptyStringArray(inputArray: string[]): boolean {
    return !(inputArray && inputArray.length > 0);
  }

  public static isEmptyArray(inputArray: object[]): boolean {
    return !(inputArray && inputArray.length > 0);
  }

  public static isEmptyString(input: string): boolean {
    return !(input && input.length > 0);
  }

  public static round(input: number, digits: number = 10000): number {
    if (digits > 0) {
      input = Math.round(input * digits) / digits;
    }
    return input;
  }

  public static examplesToUtteranceLabelMaps(
    examples: any,
    utterancesLabelsMap: { [id: string]: string[] },
    utterancesDuplicateLabelsMap: Map<string, Set<string>>): void {
    const exampleStructureArray: Example[] = Utility.examplesToArray(examples);
    for (const example of exampleStructureArray) {
      const utterance: string = example.text;
      const labels: Label[] = example.labels;
      for (const label of labels) {
        OrchestratorHelper.addNewLabelUtterance(
          utterance,
          label.name,
          '',
          utterancesLabelsMap,
          utterancesDuplicateLabelsMap);
      }
    }
  }

  public static examplesToArray(examples: any): Example[] {
    const exampleStructureArray: Example[] = [];
    for (const example of examples) {
      const labels: Label[] = [];
      for (const example_label of example.labels) {
        const label: string = example_label.name;
        const label_type: number = example_label.label_type;
        const label_span: any = example_label.span;
        const label_span_offset: number = label_span.offset;
        const label_span_length: number = label_span.length;
        const labelStructure: Label = new Label(label_type, label, new Span(label_span_offset, label_span_length));
        labels.push(labelStructure);
      }
      const exampleStructure: Example = new Example(example.text, labels);
      exampleStructureArray.push(exampleStructure);
    }
    return exampleStructureArray;
  }

  public static scoreResultsToArray(
    results: any,
    labelIndexMap: {[id: string]: number}, digits: number = 10000): Result[] {
    const scoreResultArray: Result[] = [];
    for (const result of results) {
      if (result) {
        const score: number = Utility.round(result.score, digits);
        const result_label: any = result.label;
        const label: string = result_label.name;
        const label_type: number = result_label.label_type;
        const label_span: any = result_label.span;
        const label_span_offset: number = label_span.offset;
        const label_span_length: number = label_span.length;
        const closest_text: string = result.closest_text;
        const scoreResult: Result = new Result(
          new Label(label_type, label, new Span(label_span_offset, label_span_length)),
          score,
          closest_text);
        const labelIndex: number = labelIndexMap[label];
        if (labelIndex >= 0) {
          scoreResultArray[labelIndex] = scoreResult;
        }
      }
    }
    return scoreResultArray;
  }

  public static buildStringIdNumberValueDictionaryFromUniqueStringArray(
    inputStringArray: string[]): {[id: string]: number} {
    const stringMap: {[id: string]: number} = { };
    for (let index: number = 0; index < inputStringArray.length; index++) {
      stringMap[inputStringArray[index]] = index;
    }
    return stringMap;
  }

  public static buildStringIdNumberValueDictionaryFromStringArray(
    inputStringArray: string[]): {
      'stringArray': string[];
      'stringMap': {[id: string]: number};} {
    const stringSet: Set<string> = new Set(inputStringArray);
    let stringArray: string[] = [...stringSet.values()];
    stringArray = Utility.sortStringArray(stringArray);
    const stringMap: {[id: string]: number} =
      Utility.buildStringIdNumberValueDictionaryFromUniqueStringArray(stringArray);
    return {stringArray, stringMap};
  }

  public static buildStringIdNumberValueDictionaryFromStringArrays(
    inputStringArrays: string[][]): {
      'stringArray': string[];
      'stringMap': {[id: string]: number}; } {
    const stringSet: Set<string> = new Set();
    for (const elementStringArray of inputStringArrays) {
      for (const elementString of elementStringArray) {
        stringSet.add(elementString);
      }
    }
    let stringArray: string[] = [...stringSet.values()];
    stringArray = Utility.sortStringArray(stringArray);
    const stringMap: {[id: string]: number} =
      Utility.buildStringIdNumberValueDictionaryFromUniqueStringArray(stringArray);
    return {stringArray, stringMap};
  }

  public static sortStringArray(inputStringArray: string[]): string[] {
    return inputStringArray.sort(
      (n1: string, n2: string) => {
        if (n1 > n2) {
          return 1;
        }
        if (n1 < n2) {
          return -1;
        }
        return 0;
      });
  }

  public static convertStringKeyGenericSetNativeMapToDictionary<T>(
    stringKeyGenericSetMap: Map<string, Set<T>>): { [id: string]: Set<T> } {
    const stringIdGenericSetDictionary: { [id: string]: Set<T> } = {};
    for (const key in stringKeyGenericSetMap) {
      if (key) {
        const value: Set<T> | undefined = stringKeyGenericSetMap.get(key);
        stringIdGenericSetDictionary[key] = value as Set<T>;
      }
    }
    return stringIdGenericSetDictionary;
  }

  public static convertStringKeyGenericValueValueNativeMapToDictionary<T>(
    stringKeyGenericValueMap: Map<string, T>): { [id: string]: T } {
    const stringIdGenericValueDictionary: { [id: string]: T } = {};
    for (const key in stringKeyGenericValueMap) {
      if (key) {
        const value: T | undefined = stringKeyGenericValueMap.get(key);
        stringIdGenericValueDictionary[key] = value as T;
      }
    }
    return stringIdGenericValueDictionary;
  }

  public static insertStringPairToStringIdStringSetNativeMap(
    key: string,
    value: string,
    stringKeyStringSetMap: Map<string, Set<string>>): Map<string, Set<string>> {
    if (!stringKeyStringSetMap) {
      stringKeyStringSetMap = new Map<string, Set<string>>();
    }
    if (key in stringKeyStringSetMap) {
      let stringSet: Set<string> | undefined = stringKeyStringSetMap.get(key);
      if (!stringSet) {
        stringSet = new Set<string>();
        stringKeyStringSetMap.set(key, stringSet);
      }
      stringSet.add(value);
    } else {
      const stringSet: Set<string> = new Set<string>();
      stringKeyStringSetMap.set(key, stringSet);
      stringSet.add(value);
    }
    return stringKeyStringSetMap;
  }

  public static countMapValues(inputStringToStringArrayMap: { [id: string]: string[] }): number {
    return Object.entries(inputStringToStringArrayMap).reduce(
      (accumulant: number,  value: [string, string[]]) => accumulant + value[1].length, 0);
  }

  public static jsonstringify(input: any): string {
    return JSON.stringify(input, null, 4);
  }

  public static loadFile(
    filename: string,
    encoding: string = 'utf8'): string {
    Utility.debuggingLog(
      `Utility.loadFile(): filename=${filename}`);
    Utility.debuggingLog(
      `Utility.loadFile(): process.cmd()=${process.cwd()}`);
    try {
      const fileContent: string = fs.readFileSync(filename, encoding);
      return fileContent;
    } catch (error) {
      Utility.debuggingThrow(
        `Utility.loadFile(): filename=${filename}, exception=${error}`);
    }
    return '';
  }

  public static dumpFile(
    filename: string,
    content: any,
    encoding: string = 'utf8'): string {
    // Utility.debuggingLog(
    //     `Utility.dumpFile(): filename=${filename}`);
    try {
      fs.writeFileSync(filename, content, encoding);
    } catch (error) {
      // ---- NOTE ---- An error occurred
      Utility.debuggingThrow(`FAILED to dump a file: filename=${filename}, exception=${error}`);
      return '';
    }
    return filename;
  }

  public static exists(pathToFileSystemEntry: string): boolean {
    return fs.existsSync(pathToFileSystemEntry);
  }

  public static writeToConsole(outputContents: string) {
    const output: string = JSON.stringify(outputContents, null, 2);
    process.stdout.write(`${output}\n`);
  }

  public static debuggingLog(
    message: any): string {
    const dateTimeString: string = (new Date()).toISOString();
    const logMessage: string = `[${dateTimeString}] LOG-MESSAGE: ${message}`;
    if (Utility.toPrintDebuggingLogToConsole) {
      // eslint-disable-next-line no-console
      console.log(logMessage);
    }
    return logMessage;
  }

  public static debuggingThrow(
    message: any): void {
    const dateTimeString: string = (new Date()).toISOString();
    const logMessage: string = `[${dateTimeString}] ERROR-MESSAGE: ${message}`;
    const error: Error = new Error(Utility.jsonstringify(logMessage));
    const stackTrace: string = error.stack as string;
    Utility.debuggingLog(stackTrace);
    throw error;
  }

  public static moveFile(file: string, targetDir: string) {
    const f: string = path.basename(file);
    const dest: string = path.resolve(targetDir, f);

    fs.rename(file, dest, (err: any) => {
      if (err) throw err;
    });
  }
}
