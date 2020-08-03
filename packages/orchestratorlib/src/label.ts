/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {LabelType}  from './label-type';
import {Span}  from './span';

export class Label {
  public static newIntentLabel(label: string, spanOffset: number = 0, spanLength: number = 0): Label {
    return new Label(LabelType.Intent, label, new Span(spanOffset, spanLength));
  }

  constructor(label_type: LabelType, name: string, span: Span) {
    this.label_type = label_type;
    this.name = name;
    this.span = span;
  }

  public toObject(): {
    'name': string;
    'label_type': number;
    'span': {
      'offset': number;
      'length': number; }; } {
    return {
      name: this.name,
      label_type: this.label_type,
      span: this.span.toObject(),
    };
  }

  public label_type: LabelType;

  public name: string;

  public span: Span;
}
