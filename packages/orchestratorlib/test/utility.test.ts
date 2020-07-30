/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import assert = require('assert');

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
  it('Test.0000 exampleFunctionUtility()', function () {
    Utility.toPrintDebuggingLogToConsole = true; // UnitTestHelper.getDefaultUnitTestDebuggingLogFlag();
    this.timeout(UnitTestHelper.getDefaultUnitTestTimeout());
    Utility.debuggingLog(
      `process.cwd()=${process.cwd()}`);
    Utility.debuggingLog(
      `process.argv=${process.argv}`);
    // const filename: string = '../src/resources/data/Email.txt';
  });
});

