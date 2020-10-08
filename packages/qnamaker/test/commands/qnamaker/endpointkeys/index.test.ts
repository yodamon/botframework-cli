/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { expect, test } from '@oclif/test';

describe('qnamaker:endpointkeys:index', () => {
  test
    .stdout()
    .command(['qnamaker:endpointkeys'])
    .it('runs', (ctx) => {
      expect(ctx.stdout).to.contain('');
    });
});
