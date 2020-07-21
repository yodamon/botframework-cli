/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// ---- NOTE ---- the following eslint disable should not have had needed.
// eslint-disable-next-line unicorn/filename-case
export class Span {
  constructor(offset: number, length: number) {
    this.offset = offset;
    this.length = length;
  }

  public offset: number;

  public length: number;
}
