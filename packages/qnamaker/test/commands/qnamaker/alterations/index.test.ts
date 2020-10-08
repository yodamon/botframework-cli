/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { expect, test } from '@oclif/test';

describe('qnamaker:alterations:index', () => {
  test
    .stdout()
    .command(['qnamaker:alterations'])
    .it('runs', (ctx) => {
      expect(ctx.stdout).to.contain('');
    });
});
