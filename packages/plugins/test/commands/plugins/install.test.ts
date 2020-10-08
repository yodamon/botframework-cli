/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { expect, test } from '@oclif/test';

describe('plugins:install', () => {
  test
    .stderr()
    .command(['plugins:install', 'someplugin'])
    .it('runs plugins:install someplugin', (ctx) => {
      expect(ctx.stderr).to.contain('someplugin is blacklisted');
    });
});
