/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as fs from 'fs';
import * as path from 'path';
import {Utility} from './utility';
const fetch: any = require('node-fetch');

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

      const versions: any = await OrchestratorNlr.getNlrVersionsAsync();
      if (!versions) {
        throw new Error('Failed getting nlr_versions.json');
      }

      const modelInfo: any = versions.models[versionId];
      if (!modelInfo) {
        throw new Error(`Model info for version ${versionId} not found`);
      }

      const url: string = modelInfo.onnxModelUri;
      const fileName: string = url.substring(url.lastIndexOf('/') + 1);
      const res: any = await fetch(url);
      const fileStream: any = fs.createWriteStream(path.join(nlrPath, fileName));
      res.body.pipe(fileStream);
      res.body.on('error', () => {
        throw new Error(`Failed downloading model version ${versionId}`);
      });
      fileStream.on('finish', () => {
        Utility.debuggingLog('FINISH DOWNLOADING');
      });
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
