/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {Result}  from './result';

export class ScoreStructure {
  // eslint-disable-next-line max-params
  constructor(
    utterance: string,
    labelsPredictedEvaluation: number, // ---- 0: TP, 1, FN, 2: FP, 3: TN
    labels: string[],
    labelsPredicted: string[],
    labelsPredictedScore: number,
    labelsPredictedIndexes: number[],
    scoreResultArray: Result[]) {
    this.utterance = utterance;
    this.labelsPredictedEvaluation = labelsPredictedEvaluation;
    this.labels = labels;
    this.labelsPredicted = labelsPredicted;
    this.labelsPredictedScore = labelsPredictedScore;
    this.labelsPredictedIndexes = labelsPredictedIndexes;
    this.scoreResultArray = scoreResultArray;
  }

  public utterance: string;

  public labelsPredictedEvaluation: number; // ---- 0: TP, 1, FN, 2: FP, 3: TN

  public labels: string[];

  public labelsPredicted: string[];

  public labelsPredictedScore: number;

  public labelsPredictedIndexes: number[];

  public scoreResultArray: Result[];
}
