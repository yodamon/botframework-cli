/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {CLIError} from '@microsoft/bf-cli-command';
import {OrchestratorHelper, Utility} from '@microsoft/bf-orchestrator';

import * as fs from 'fs-extra';
import * as path from 'path';
const ReadText: any = require('read-text-file');

export class OrchestratorSettings {
  public static ModelPath: string;

  public static SnapshotPath: string;

  public static SettingsPath: string;

  public static readFile(filePath: string): string {
    try {
      return ReadText.readSync(filePath);
    } catch (error) {
      throw new CLIError(error);
    }
  }

  public static writeToFile(filePath: string, content: string): string {
    try {
      fs.writeFileSync(filePath, content);
      return filePath;
    } catch (error) {
      throw new CLIError(error);
    }
  }

  public static init(settingsDir: string, nlrPath: string, outputPath: string)  {
    const settingsFile: string = path.join(settingsDir, 'orchestrator.json');
    OrchestratorSettings.SettingsPath = settingsFile;
    let settings: any;
    OrchestratorSettings.ModelPath = '';
    OrchestratorSettings.SnapshotPath = '';

    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);

      if (!OrchestratorHelper.exists(nlrPath)) {
        Utility.debuggingLog(`Invalid model path ${nlrPath}`);
        throw new Error('Invalid model path');
      }
    } else {
      throw new Error('Missing model path');
    }

    if (outputPath) {
      outputPath = path.resolve(outputPath);

      if (OrchestratorHelper.isDirectory(outputPath)) {
        outputPath = path.join(outputPath, 'orchestrator.blu');
      } else {
        const outputFolder: string = path.dirname(outputPath);
        if (!OrchestratorHelper.exists(outputFolder)) {
          Utility.debuggingLog(`Invalid output path ${outputPath}`);
          throw new Error('Invalid output path');
        }
      }
    } else {
      throw new Error('Missing output path');
    }

    if (fs.existsSync(settingsFile)) {
      settings = JSON.parse(OrchestratorSettings.readFile(settingsFile));
      OrchestratorSettings.ModelPath = settings.modelPath;
      OrchestratorSettings.SnapshotPath = settings.SnapshotPath;
    } else {
      OrchestratorSettings.ModelPath = nlrPath;
      OrchestratorSettings.SnapshotPath = settings.SnapshotPath;
    }
  }

  public static persist()  {
    if (OrchestratorSettings.SettingsPath.length === 0) {
      throw new CLIError('settings not initialized.');
    }
    try {
      const settings: any = {
        modelPath: OrchestratorSettings.ModelPath,
        snapshotPath: OrchestratorSettings.SnapshotPath,
      };

      OrchestratorSettings.writeToFile(OrchestratorSettings.SettingsPath, JSON.stringify(settings));
    } catch (error) {
      throw new CLIError(error);
    }
  }
}
