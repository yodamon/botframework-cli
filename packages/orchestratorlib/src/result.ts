/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {Label}  from './label';

export class Result {
  constructor(label: Label, score: number, closest_text: string) {
    this.label = label;
    this.score = score;
    this.closest_text = closest_text;
  }

  public label: Label;

  public score: number;

  public closest_text: string;
}
