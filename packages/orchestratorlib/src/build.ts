/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import {Utility} from './utility';
import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

export class OrchestratorBuild {
  public static Orchestrator: any;

  public static IsDialog: boolean;

  public static LuConfigFile: string;

  public static OutputPath: string;

  // eslint-disable-next-line max-params
  public static async runAsync(nlrPath: string, inputPath: string, outputPath: string, isDialog: boolean = false, luConfigFile: string = '') {
    try {
      if (!nlrPath || nlrPath.length === 0) {
        throw new Error('Please provide path to Orchestrator model');
      }

      if (!inputPath || inputPath.length === 0) {
        throw new Error('Please provide path to input file/folder');
      }

      if (!outputPath || outputPath.length === 0) {
        throw new Error('Please provide output path');
      }

      nlrPath = path.resolve(nlrPath);
      outputPath = path.resolve(outputPath);

      const orchestrator: any = await LabelResolver.loadNlrAsync(nlrPath);
      Utility.debuggingLog('Loaded nlr');

      OrchestratorBuild.IsDialog = isDialog;
      OrchestratorBuild.LuConfigFile = luConfigFile;
      OrchestratorBuild.Orchestrator = orchestrator;
      OrchestratorBuild.OutputPath = outputPath;

      if (OrchestratorHelper.isDirectory(inputPath)) {
        await OrchestratorBuild.iterateInputFolder(inputPath);
      } else {
        await OrchestratorBuild.processLuFile(inputPath);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  private static async processLuFile(luFile: string) {
    const utterancesLabelsMap: { [id: string]: string[] } = {};
    const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    const labelResolver: any = OrchestratorBuild.Orchestrator.createLabelResolver();
    Utility.debuggingLog('Created label resolver');

    await OrchestratorHelper.processFile(luFile, path.basename(luFile), utterancesLabelsMap, utterancesDuplicateLabelsMap, false);
    const snapshot: any = labelResolver.createSnapshot();

    const snapshotFile: any = path.join(OrchestratorBuild.OutputPath, path.basename(luFile, '.lu'));
    OrchestratorHelper.writeToFile(snapshotFile, snapshot);
    Utility.debuggingLog(`Snapshot written to ${snapshotFile}`);
  }

  private static async iterateInputFolder(inputPath: string) {
    const items: string[] = fs.readdirSync(inputPath);
    for (const item of items) {
      const currentItemPath: string = path.join(OrchestratorBuild.OutputPath, item);
      const isDirectory: boolean = fs.lstatSync(currentItemPath).isDirectory();

      if (isDirectory) {
        // eslint-disable-next-line no-await-in-loop
        await OrchestratorBuild.iterateInputFolder(currentItemPath);
      } else {
        const ext: string = path.extname(item);
        if (ext === '.lu') {
          // eslint-disable-next-line no-await-in-loop
          await OrchestratorBuild.processLuFile(currentItemPath);
        }
      }
    }
  }
}
