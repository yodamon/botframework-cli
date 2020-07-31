/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import assert = require('assert');

import {} from 'mocha';

import {Utility} from '../src/utility';

export class UnitTestHelper {
  public static getDefaultUnitTestTimeout(): number {
    return 80000;
  }

  public static getDefaultUnitTestDebuggingLogFlag(): boolean {
    return false;
  }

  public static getDefaultUnitTestCleanUpFlag(): boolean {
    return true;
  }
}

describe('Test Suite - utility', () => {
  it('Test.0000 Utility.exists()', function () {
    Utility.toPrintDebuggingLogToConsole = UnitTestHelper.getDefaultUnitTestDebuggingLogFlag();
    this.timeout(UnitTestHelper.getDefaultUnitTestTimeout());
    Utility.debuggingLog(
      `process.cwd()=${process.cwd()}`);
    const doesExist: boolean = Utility.exists('resources/data/Columnar/Email.txt');
    Utility.debuggingLog(`doesExist=${doesExist}`);
    assert.ok(doesExist);
  });
});

