/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Utility} from './utility';
import {OrchestratorHelper} from './orchestratorhelper';
const fetch = require('node-fetch');

export class OrchestratorNlr {
  public static async getAsync(nlrPath: string, versionId: string) {
    try {
      if (nlrPath) {
        nlrPath = path.resolve(nlrPath);
      }

      if (nlrPath.length === 0) {
        throw new Error('Please provide path to Orchestrator model');
      }

      Utility.debuggingLog(`Version id: ${versionId}`);
      OrchestratorHelper.writeToFile(nlrPath, 'boooooo');
    } catch (error) {
      throw new Error(error);
    }
  }

  public static async getNlrVersionsAsync(): Promise<string> {
    const response: any = await fetch('https://aka.ms/nlrversions');
    return response.json();
  }

  public static async listAsync(): Promise<string> {
    const json: any = await OrchestratorNlr.getNlrVersionsAsync();
    return JSON.stringify(json, null, 2);
  }
}
