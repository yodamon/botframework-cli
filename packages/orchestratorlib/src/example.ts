/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {Label}  from './label';

export class Example {
  constructor(text: string, labels: Label[]) {
    this.text = text;
    this.labels = labels;
  }

  public text: string;

  public labels: Label[];
}
