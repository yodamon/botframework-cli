/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {LabelType}  from './label-type';
import {Span}  from './span';

export class Label {
  constructor(type: LabelType, name: string, span: Span) {
    this.type = type;
    this.name = name;
    this.span = span;
  }

  public type: LabelType;

  public name: string;

  public span: Span;
}
