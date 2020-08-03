/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import assert = require('assert');

import {} from 'mocha';

import {OrchestratorHelper} from '../src/orchestratorhelper';
import {Utility} from '../src/utility';
import {UnitTestHelper} from './utility.test';

describe('Test Suite - orchestratorhelper', () => {
  it('Test.0000 OrchestratorHelper.addNewLabelUtterance()', function () {
    Utility.toPrintDebuggingLogToConsole = UnitTestHelper.getDefaultUnitTestDebuggingLogFlag();
    this.timeout(UnitTestHelper.getDefaultUnitTestTimeout());
    const utterance: string = 'hi';
    const label: string = 'greeting';
    const hierarchicalLabel: string = '';
    const utteranceLabelsMap: { [id: string]: string[] } = {};
    const utteranceLabelDuplicateMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    OrchestratorHelper.addNewLabelUtterance(
      utterance,
      label,
      hierarchicalLabel,
      utteranceLabelsMap,
      utteranceLabelDuplicateMap);
    Utility.debuggingLog(
      `utteranceLabelsMap=${Utility.jsonStringify(utteranceLabelsMap)}`);
    assert.ok(Object.entries(utteranceLabelsMap).length === 1);
    assert.ok(utteranceLabelsMap[utterance].length === 1);
  });
  it('Test.0001 OrchestratorHelper.addNewLabelUtterance() empty label', function () {
    Utility.toPrintDebuggingLogToConsole = UnitTestHelper.getDefaultUnitTestDebuggingLogFlag();
    this.timeout(UnitTestHelper.getDefaultUnitTestTimeout());
    const utterance: string = 'afadf ;mdc';
    const label: string = '';
    const hierarchicalLabel: string = '';
    const utteranceLabelsMap: { [id: string]: string[] } = {};
    const utteranceLabelDuplicateMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    OrchestratorHelper.addNewLabelUtterance(
      utterance,
      label,
      hierarchicalLabel,
      utteranceLabelsMap,
      utteranceLabelDuplicateMap);
    Utility.debuggingLog(
      `utteranceLabelsMap=${Utility.jsonStringify(utteranceLabelsMap)}`);
    assert.ok(Object.entries(utteranceLabelsMap).length === 1);
    assert.ok(utteranceLabelsMap[utterance].length === 1);
    assert.ok(utteranceLabelsMap[utterance][0] === '');
  });
});

