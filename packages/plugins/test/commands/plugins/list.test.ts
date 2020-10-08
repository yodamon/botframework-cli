/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { expect, test } from '@oclif/test';

describe('plugins:list', () => {
  test
    .stderr()
    .command(['plugins:list'])
    .it('plugins:list', (ctx) => {
      expect(ctx.stderr).to.contain('no plugins installed\n');
    });
});
