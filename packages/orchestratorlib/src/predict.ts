/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

import * as readline from 'readline';

import {MultiLabelConfusionMatrix} from '@microsoft/bf-dispatcher';
import {MultiLabelConfusionMatrixSubset} from '@microsoft/bf-dispatcher';

import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

import {Example} from './example';
// import {Label} from './label';
import {LabelType} from './label-type';
// import {OrchestratorHelper} from './orchestratorhelper';
// import {Result} from './result';
import {ScoreStructure} from './score-structure';
// import {Span} from './span';

import {Utility} from './utility';

/* eslint-disable no-console */
export class OrchestratorPredict {
  static readonly commandprefix: string =
    'Please enter a commandlet, "h" for help > ';

  static readonly questionForUtterance: string =
    'Please enter an utterance > ';

  static readonly questionForCurrentIntentLabel: string =
    'Please enter a "current" intent label > ';

  static readonly questionForNewIntentLabel: string =
    'Please enter a "new" intent label > ';

  static readonly questionForUtteranceLabelsFromDuplicates: string =
    'Please enter an index from the Duplicates report > ';

  static readonly questionForUtteranceLabelsFromAmbiguous: string =
    'Please enter an index from the Ambiguous report > ';

  static readonly questionForUtteranceLabelsFromMisclassified: string =
    'Please enter an index from the Misclassified report > ';

  static readonly questionForUtteranceLabelsFromLowConfidence: string =
    'Please enter an index from the Low-Confidence report > ';

  static readonly questionForAmbiguousThreshold: string =
    'Please enter a threshold for generating the Ambiguous report > ';

  static readonly questionForLowConfidenceThreshold: string =
    'Please enter a threshold for generating the Low-Confidence report > ';

  static readonly questionForMultiLabelPredictionThreshold: string =
    'Please enter a threshold for multi-label prediction > ';

  static readonly questionForunknownLabelPredictionThreshold: string =
    'Please enter a threshold for unknow label prediction > ';

  static readonly interactive: readline.Interface = readline.createInterface(process.stdin, process.stdout);

  static readonly question: any = function (prefix: string) {
    return new Promise((resolve: any, _reject: any) => {
      OrchestratorPredict.interactive.question(prefix, (answer: string) => {
        resolve(answer);
      });
    });
  };

  protected inputPath: string = '';

  protected outputPath: string = '';

  protected nlrPath: string = '';

  protected ambiguousCloseness: number = Utility.DefaultAmbiguousClosenessParameter;

  protected lowConfidenceScoreThreshold: number = Utility.DefaultLowConfidenceScoreThresholdParameter;

  protected multiLabelPredictionThreshold: number = Utility.DefaultMultiLabelPredictionThresholdParameter;

  protected unknownLabelPredictionThreshold: number = Utility.DefaultUnknownLabelPredictionThresholdParameter;

  protected trainingFile: string = '';

  protected predictingSetScoreOutputFilename: string = '';

  protected predictingSetSummaryOutputFilename: string = '';

  protected labelsOutputFilename: string = '';

  protected trainingFileOutput: string = '';

  protected labelResolver: any;

  protected currentUtterance: string = '';

  protected currentIntentLabels: string[] = [];

  protected newIntentLabels: string[] = [];

  protected currentLabelArrayAndMap: {
    'stringArray': string[];
    'stringMap': {[id: string]: number};} = {
      stringArray: [],
      stringMap: {}};

  protected currentUtteranceLabelsMap: { [id: string]: string[] } = {};

  protected currentUtteranceLabelDuplicateMap: Map<string, Set<string>> = new Map<string, Set<string>>();

  protected currentEvaluationOutput: {
    'evaluationReportLabelUtteranceStatistics': {
      'evaluationSummaryTemplate': string;
      'labelArrayAndMap': {
        'stringArray': string[];
        'stringMap': {[id: string]: number};};
      'labelStatisticsAndHtmlTable': {
        'labelUtterancesMap': { [id: string]: string[] };
        'labelUtterancesTotal': number;
        'labelStatistics': string[][];
        'labelStatisticsHtml': string;};
      'utteranceStatisticsAndHtmlTable': {
        'utteranceStatisticsMap': {[id: number]: number};
        'utteranceStatistics': [string, number][];
        'utteranceCount': number;
        'utteranceStatisticsHtml': string;};
      'utterancesMultiLabelArrays': [string, string][];
      'utterancesMultiLabelArraysHtml': string;
      'utteranceLabelDuplicateHtml': string; };
    'evaluationReportAnalyses': {
      'evaluationSummaryTemplate': string;
      'ambiguousAnalysis': {
        'scoringAmbiguousUtterancesArrays': string[][];
        'scoringAmbiguousUtterancesArraysHtml': string;
        'scoringAmbiguousUtteranceSimpleArrays': string[][];};
      'misclassifiedAnalysis': {
        'scoringMisclassifiedUtterancesArrays': string[][];
        'scoringMisclassifiedUtterancesArraysHtml': string;
        'scoringMisclassifiedUtterancesSimpleArrays': string[][];};
      'lowConfidenceAnalysis': {
        'scoringLowConfidenceUtterancesArrays': string[][];
        'scoringLowConfidenceUtterancesArraysHtml': string;
        'scoringLowConfidenceUtterancesSimpleArrays': string[][];};
      'confusionMatrixAnalysis': {
        'confusionMatrix': MultiLabelConfusionMatrix;
        'multiLabelConfusionMatrixSubset': MultiLabelConfusionMatrixSubset;
        'scoringConfusionMatrixOutputLines': string[][];
        'confusionMatrixMetricsHtml': string;
        'confusionMatrixAverageMetricsHtml': string;}; };
    'scoreStructureArray': ScoreStructure[];
  } = Utility.generateEmptyEvaluationReport();

  /* eslint-disable max-params */
  /* eslint-disable complexity */
  constructor(
    nlrPath: string, inputPath: string, outputPath: string,
    ambiguousClosenessParameter: number,
    lowConfidenceScoreThresholdParameter: number,
    multiLabelPredictionThresholdParameter: number,
    unknownLabelPredictionThresholdParameter: number) {
    // ---- NOTE ---- process arguments
    if (Utility.isEmptyString(inputPath)) {
      Utility.debuggingThrow('Please provide path to an input .blu file');
    }
    if (Utility.isEmptyString(outputPath)) {
      Utility.debuggingThrow('Please provide an output directory');
    }
    if (Utility.isEmptyString(nlrPath)) {
      Utility.debuggingThrow('The nlrPath argument is empty');
    }
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    } else {
      nlrPath = '';
    }
    Utility.debuggingLog(`inputPath=${inputPath}`);
    Utility.debuggingLog(`outputPath=${outputPath}`);
    Utility.debuggingLog(`nlrPath=${nlrPath}`);
    Utility.debuggingLog(`ambiguousClosenessParameter=${ambiguousClosenessParameter}`);
    Utility.debuggingLog(`lowConfidenceScoreThresholdParameter=${lowConfidenceScoreThresholdParameter}`);
    Utility.debuggingLog(`multiLabelPredictionThresholdParameter=${multiLabelPredictionThresholdParameter}`);
    Utility.debuggingLog(`unknownLabelPredictionThresholdParameter=${unknownLabelPredictionThresholdParameter}`);
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.nlrPath = nlrPath;
    this.ambiguousCloseness = ambiguousClosenessParameter;
    this.lowConfidenceScoreThreshold = lowConfidenceScoreThresholdParameter;
    this.multiLabelPredictionThreshold = multiLabelPredictionThresholdParameter;
    this.unknownLabelPredictionThreshold = unknownLabelPredictionThresholdParameter;
    // ---- NOTE ---- load the training set
    this.trainingFile = this.inputPath;
    // if (!Utility.exists(this.trainingFile)) {
    //   Utility.debuggingThrow(`training set file does not exist, trainingFile=${trainingFile}`);
    // }
    this.predictingSetScoreOutputFilename = path.join(this.outputPath, 'orchestrator_predicting_set_scores.txt');
    this.predictingSetSummaryOutputFilename = path.join(this.outputPath, 'orchestrator_predicting_set_summary.html');
    this.labelsOutputFilename = path.join(this.outputPath, 'orchestrator_labels.txt');
    this.trainingFileOutput = path.join(this.outputPath, 'orchestrator.blu');
  }

  public async buildLabelResolver(): Promise<void> {
    // ---- NOTE ---- create a LabelResolver object.
    Utility.debuggingLog('OrchestratorPredict.runAsync(), ready to call LabelResolver.createWithSnapshotAsync()');
    if (Utility.exists(this.trainingFile)) {
      this.labelResolver = await LabelResolver.createWithSnapshotAsync(this.nlrPath, this.trainingFile);
    } else {
      this.labelResolver = await LabelResolver.createAsync(this.nlrPath);
    }
    Utility.debuggingLog('OrchestratorPredict.runAsync(), after calling LabelResolver.createWithSnapshotAsync()');
  }

  public static async runAsync(
    nlrPath: string, inputPath: string, outputPath: string,
    ambiguousClosenessParameter: number,
    lowConfidenceScoreThresholdParameter: number,
    multiLabelPredictionThresholdParameter: number,
    unknownLabelPredictionThresholdParameter: number): Promise<number> {
    const orchestratorPredict: OrchestratorPredict = new OrchestratorPredict(
      nlrPath,
      inputPath,
      outputPath,
      ambiguousClosenessParameter,
      lowConfidenceScoreThresholdParameter,
      multiLabelPredictionThresholdParameter,
      unknownLabelPredictionThresholdParameter);
    // ---- NOTE ---- create a LabelResolver object.
    await orchestratorPredict.buildLabelResolver();
    // ---- NOTE ---- prepare readline.
    let command: string = '';
    // ---- NOTE ---- enter the interaction loop.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      console.log(`> "Current" utterance:          "${orchestratorPredict.currentUtterance}"`);
      console.log(`> "Current" intent label array: "${orchestratorPredict.currentIntentLabels}"`);
      console.log(`> "New"     intent label array: "${orchestratorPredict.newIntentLabels}"`);
      // eslint-disable-next-line no-await-in-loop
      command = await OrchestratorPredict.question(OrchestratorPredict.commandprefix);
      command = command.trim();
      Utility.debuggingLog(`The command you entered is "${command}"`);
      if (command === 'q') {
        break;
      }
      switch (command) {
      case 'h': orchestratorPredict.commandLetH();
        break;
      case 'd': orchestratorPredict.commandLetD();
        break;
      case 's': orchestratorPredict.commandLetS();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'u': await orchestratorPredict.commandLetU();
        break;
      case 'cu': orchestratorPredict.commandLetCU();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'i': await orchestratorPredict.commandLetI();
        break;
      case 'ci': orchestratorPredict.commandLetCI();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'ni': await orchestratorPredict.commandLetNI();
        break;
      case 'cni': orchestratorPredict.commandLetCNI();
        break;
      case 'f': orchestratorPredict.commandLetF();
        break;
      case 'p': orchestratorPredict.commandLetP();
        break;
      case 'v': orchestratorPredict.commandLetV();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'vd': await orchestratorPredict.commandLetVD();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'va': await orchestratorPredict.commandLetVA();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'vm': await orchestratorPredict.commandLetVM();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'vl': await orchestratorPredict.commandLetVL();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'vat': await orchestratorPredict.commandLetVAT();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'vlt': await orchestratorPredict.commandLetVLT();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'vmt': await orchestratorPredict.commandLetVMT();
        break;
      // eslint-disable-next-line no-await-in-loop
      case 'vut': await orchestratorPredict.commandLetVUT();
        break;
      case 'a': orchestratorPredict.commandLetA();
        break;
      case 'r': orchestratorPredict.commandLetR();
        break;
      case 'c': orchestratorPredict.commandLetC();
        break;
      case 'rl': orchestratorPredict.commandLetRL();
        break;
      case 'n': orchestratorPredict.commandLetN();
        break;
      default:
        console.log(`> Cannot recognize the command you just entered "${command}",`);
        console.log('> please type "h" for help!');
        break;
      }
    }
    // eslint-disable-next-line no-console
    console.log('> Bye!');
    return 0;
  }

  public commandLetH(): number {
    console.log('  Commandlets: h, q, d, s, u, cu, i, ci, ni, cni, q, p, v, vd, va, vm, vl, vat, vlt, vmt, vut, a, r, c, rl, n');
    console.log('    h   - print this help message');
    console.log('    q   - quit');
    console.log('    d   - display utterance, intent label array inputs, Orchestrator config, and the label-index map');
    console.log('          and the label-index map');
    console.log('    s   - show label-utterance statistics of the model examples');
    console.log('    u   - enter a new utterance and save it as the "current" utterance input');
    console.log('    cu  - clear the "current" utterance input');
    console.log('    i   - enter an intent and add it to the "current" intent label array input ');
    console.log('          (can be an index for retrieving a label from the label-index map)');
    console.log('    ci  - clear the "current" intent label array input');
    console.log('    ni  - enter an intent and add it to the "new" intent label array input ');
    console.log('          (can be an index for retrieving a label from the label-index map)');
    console.log('    cni - clear the "new" intent label array input');
    console.log('    f   - find the "current" utterance and see if it is already in the model example set');
    console.log('    p   - make a prediction on the "current" utterance input');
    console.log('    v   - validate the model and save analyses (validation report) to ');
    console.log(`          "${this.predictingSetSummaryOutputFilename}"`);
    console.log('    vd  - reference the validation Duplicates report (previously generated by the "v" command) ');
    console.log('          and enter an index for retrieving utterance/intents and save them into "current"');
    console.log('    va  - reference the validation Ambiguous report (previously generated by the "v" command) ');
    console.log('          and enter an index for retrieving utterance/intents and save them into "current"');
    console.log('    vm  - reference the validation Misclassified report (previously generated by the "v" command) ');
    console.log('          and enter an index for retrieving utterance/intents and save them into "current"');
    console.log('    vl  - reference the validation LowConfidence report (previously generated by the "v" command) ');
    console.log('          and enter an index for retrieving utterance/intents and save them into "current"');
    console.log('    vat - enter a new validation-report ambiguous closeness threshold');
    console.log('    vlt - enter a new validation-report low-confidence threshold');
    console.log('    vmt - enter a new multi-label threshold');
    console.log('    vut - enter a new unknown-label threshold');
    console.log('    a   - add the "current" utterance and intent labels to the model example set');
    console.log('    r   - remove the "current" utterance and intent labels from the model example set');
    console.log('    c   - remove the "current" utterance\'s intent labels and then ');
    console.log('          add it with the "new" intent labels to the model example set');
    console.log('    rl  - remove the "current" intent labels from the model example set');
    console.log('    n   - create a new snapshot of model examples and save it to ');
    console.log(`          ${this.trainingFileOutput}`);
    return 0;
  }

  public commandLetD(): number {
    console.log(`> "Current" utterance:          "${this.currentUtterance}"`);
    console.log(`> "Current" intent label array: "${this.currentIntentLabels}"`);
    console.log(`> "New"     intent label array: "${this.newIntentLabels}"`);
    console.log(`> Ambiguous closeness:           ${this.ambiguousCloseness}`);
    console.log(`> Low-confidence closeness:      ${this.lowConfidenceScoreThreshold}`);
    console.log(`> Multi-label threshold:         ${this.multiLabelPredictionThreshold}`);
    console.log(`> Unknown-label threshold:       ${this.unknownLabelPredictionThreshold}`);
    const labelResolverConfig: any = Utility.getLabelResolverSettings(this.labelResolver);
    console.log(`> Orchestrator configuration:         ${labelResolverConfig}`);
    const labels: string[] = this.labelResolver.getLabels(LabelType.Intent);
    this.currentLabelArrayAndMap = Utility.buildStringIdNumberValueDictionaryFromStringArray(labels);
    console.log(`> Current label-index map: ${Utility.jsonStringify(this.currentLabelArrayAndMap.stringMap)}`);
    return 0;
  }

  public commandLetS(): number {
    this.currentUtteranceLabelsMap = {};
    this.currentUtteranceLabelDuplicateMap = new Map<string, Set<string>>();
    const examples: any = this.labelResolver.getExamples();
    if (examples.length <= 0) {
      console.log('> There is no example');
      return -1;
    }
    const labels: string[] = this.labelResolver.getLabels(LabelType.Intent);
    this.currentLabelArrayAndMap = Utility.buildStringIdNumberValueDictionaryFromStringArray(labels);
    Utility.examplesToUtteranceLabelMaps(
      examples,
      this.currentUtteranceLabelsMap,
      this.currentUtteranceLabelDuplicateMap);
    const labelStatisticsAndHtmlTable: {
      'labelUtterancesMap': { [id: string]: string[] };
      'labelUtterancesTotal': number;
      'labelStatistics': string[][];
      'labelStatisticsHtml': string;
    } = Utility.generateLabelStatisticsAndHtmlTable(
      this.currentUtteranceLabelsMap,
      this.currentLabelArrayAndMap);
    const labelUtteranceCount: { [id: string]: number } = {};
    Object.entries(labelStatisticsAndHtmlTable.labelUtterancesMap).forEach(
      (x: [string, string[]]) => {
        labelUtteranceCount[x[0]] = x[1].length;
      });
    console.log(`> Per-label #examples: ${Utility.jsonStringify(labelUtteranceCount)}`);
    console.log(`> Total #examples:${labelStatisticsAndHtmlTable.labelUtterancesTotal}`);
    return 0;
  }

  public async commandLetU(): Promise<number> {
    this.currentUtterance = await OrchestratorPredict.question(OrchestratorPredict.questionForUtterance);
    return 0;
  }

  public commandLetCU(): number {
    this.currentUtterance = '';
    return 0;
  }

  public async commandLetI(): Promise<number> {
    // eslint-disable-next-line no-await-in-loop
    let label: string = await OrchestratorPredict.question(OrchestratorPredict.questionForCurrentIntentLabel);
    label = label.trim();
    const errorMessage: string = Utility.parseLabelResolverLabelEntry(
      this.labelResolver,
      label,
      this.currentIntentLabels);
    if (!Utility.isEmptyString(errorMessage)) {
      console.log(`ERROR: ${errorMessage}`);
      return -1;
    }
    return 0;
  }

  public commandLetCI(): number {
    this.currentIntentLabels = [];
    return 0;
  }

  public async commandLetNI(): Promise<number> {
    // eslint-disable-next-line no-await-in-loop
    let label: string = await OrchestratorPredict.question(OrchestratorPredict.questionForNewIntentLabel);
    label = label.trim();
    const errorMessage: string = Utility.parseLabelResolverLabelEntry(
      this.labelResolver,
      label,
      this.newIntentLabels);
    if (!Utility.isEmptyString(errorMessage)) {
      console.log(`ERROR: ${errorMessage}`);
      return -1;
    }
    return 0;
  }

  public commandLetCNI(): number {
    this.newIntentLabels = [];
    return 0;
  }

  public commandLetF(): number {
    if (Object.keys(this.currentUtteranceLabelsMap).length <= 0) {
      console.log('ERROR: Please run \'s\' commandlet first scanning the model snapshot for querying');
      return -1;
    }
    if (Utility.isEmptyString(this.currentUtterance)) {
      console.log('ERROR: The "current" utterance is empty, nothing to query for.');
      return -2;
    }
    if (this.currentUtterance in this.currentUtteranceLabelsMap) {
      console.log(`> The "current" utterance '${this.currentUtterance}' is in the model and it's intent labels are '${this.currentUtteranceLabelsMap[this.currentUtterance]}'`);
    } else {
      console.log(`> The "current" utterance '${this.currentUtterance}' is not in the model.`);
    }
    return 0;
  }

  public commandLetP(): number {
    Utility.resetLabelResolverSettingIgnoreSameExample(this.labelResolver, false);
    const scoreResults: any = this.labelResolver.score(this.currentUtterance, LabelType.Intent);
    if (!scoreResults) {
      return -1;
    }
    console.log(`> Prediction:\n${Utility.jsonStringify(scoreResults)}`);
    return 0;
  }

  public commandLetV(): number {
    const labels: string[] = this.labelResolver.getLabels(LabelType.Intent);
    const utteranceLabelsMap: { [id: string]: string[] } = {};
    const utteranceLabelDuplicateMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    const examples: any = this.labelResolver.getExamples();
    if (examples.length <= 0) {
      console.log('ERROR: There is no example in the training set, please add some.');
      return -1;
    }
    Utility.examplesToUtteranceLabelMaps(examples, utteranceLabelsMap, utteranceLabelDuplicateMap);
    Utility.resetLabelResolverSettingIgnoreSameExample(this.labelResolver, true);
    // ---- NOTE ---- integrated step to produce analysis reports.
    this.currentEvaluationOutput = Utility.generateEvaluationReport(
      this.labelResolver,
      labels,
      utteranceLabelsMap,
      utteranceLabelDuplicateMap,
      this.labelsOutputFilename,
      this.predictingSetScoreOutputFilename,
      this.predictingSetSummaryOutputFilename,
      this.ambiguousCloseness,
      this.lowConfidenceScoreThreshold,
      this.multiLabelPredictionThreshold,
      this.unknownLabelPredictionThreshold);
    if (Utility.toPrintDetailedDebuggingLogToConsole) {
      Utility.debuggingLog(`currentEvaluationOutput=${Utility.jsonStringify(this.currentEvaluationOutput)}`);
    }
    console.log(`> Leave-one-out cross validation is done and report generated in '${this.predictingSetSummaryOutputFilename}'`);
    return 0;
  }

  public async commandLetVD(): Promise<number> {
    if (!this.currentEvaluationOutput) {
      console.log('ERROR: There is no validation report, please use the "v" command to create one');
      return -1;
    }
    const labelUtterancesTotal: number =
    this.currentEvaluationOutput.evaluationReportLabelUtteranceStatistics.labelStatisticsAndHtmlTable.labelUtterancesTotal;
    if (labelUtterancesTotal <= 0) {
      console.log('ERROR: There is no examples or there is no validation report, please use the "v" command to create one');
      return -2;
    }
    const utterancesMultiLabelArrays: [string, string][] =
    this.currentEvaluationOutput.evaluationReportLabelUtteranceStatistics.utterancesMultiLabelArrays;
    // eslint-disable-next-line no-await-in-loop
    let indexInput: string = await OrchestratorPredict.question(OrchestratorPredict.questionForUtteranceLabelsFromDuplicates);
    indexInput = indexInput.trim();
    if (Utility.isEmptyString(indexInput)) {
      console.log('ERROR: Please enter an integer index to access the validation Duplicates entry');
      return -3;
    }
    if (Number.isInteger(Number(indexInput))) {
      const index: number = Number(indexInput);
      // eslint-disable-next-line max-depth
      if ((index < 0) || (index >= utterancesMultiLabelArrays.length)) {
        const errorMessage: string =
          ` The index "${index}" you entered is not in range, the array length is: ${utterancesMultiLabelArrays.length}`;
        console.log(`ERROR: ${errorMessage}`);
        return -4;
      }
      this.currentUtterance = utterancesMultiLabelArrays[index][0];
      this.currentIntentLabels = utterancesMultiLabelArrays[index][1].split(',');
    } else {
      console.log('> Please enter an integer index to access the validation Duplicates entry');
      return -5;
    }
    return 0;
  }

  public async commandLetVA(): Promise<number> {
    if (!this.currentEvaluationOutput) {
      console.log('ERROR: There is no validation report, please use the "v" command to create one');
      return -1;
    }
    const labelUtterancesTotal: number =
    this.currentEvaluationOutput.evaluationReportLabelUtteranceStatistics.labelStatisticsAndHtmlTable.labelUtterancesTotal;
    if (labelUtterancesTotal <= 0) {
      console.log('ERROR: There is no examples or there is no validation report, please use the "v" command to create one');
      return -2;
    }
    const scoringAmbiguousUtterancesSimpleArrays: string[][] =
    this.currentEvaluationOutput.evaluationReportAnalyses.ambiguousAnalysis.scoringAmbiguousUtteranceSimpleArrays;
    // eslint-disable-next-line no-await-in-loop
    let indexInput: string = await OrchestratorPredict.question(OrchestratorPredict.questionForUtteranceLabelsFromAmbiguous);
    indexInput = indexInput.trim();
    if (Utility.isEmptyString(indexInput)) {
      console.log('ERROR: Please enter an integer index to access the validation Ambiguous entry');
      return -3;
    }
    if (Number.isInteger(Number(indexInput))) {
      const index: number = Number(indexInput);
      // eslint-disable-next-line max-depth
      if ((index < 0) || (index >= scoringAmbiguousUtterancesSimpleArrays.length)) {
        const errorMessage: string =
          ` The index "${index}" you entered is not in range, the array length is: ${scoringAmbiguousUtterancesSimpleArrays.length}`;
        console.log(`ERROR: ${errorMessage}`);
        return -4;
      }
      this.currentUtterance = scoringAmbiguousUtterancesSimpleArrays[index][0];
      this.currentIntentLabels = scoringAmbiguousUtterancesSimpleArrays[index][1].split(',');
    } else {
      console.log('ERROR: Please enter an integer index to access the validation Ambiguous entry');
      return -5;
    }
    return 0;
  }

  public async commandLetVM(): Promise<number> {
    if (!this.currentEvaluationOutput) {
      console.log('ERROR: There is no validation report, please use the "v" command to create one');
      return -1;
    }
    const labelUtterancesTotal: number =
    this.currentEvaluationOutput.evaluationReportLabelUtteranceStatistics.labelStatisticsAndHtmlTable.labelUtterancesTotal;
    if (labelUtterancesTotal <= 0) {
      console.log('ERROR: There is no examples or there is no validation report, please use the "v" command to create one');
      return -2;
    }
    const scoringMisclassifiedUtterancesSimpleArrays: string[][] =
    this.currentEvaluationOutput.evaluationReportAnalyses.misclassifiedAnalysis.scoringMisclassifiedUtterancesSimpleArrays;
    // eslint-disable-next-line no-await-in-loop
    let indexInput: string = await OrchestratorPredict.question(OrchestratorPredict.questionForUtteranceLabelsFromMisclassified);
    indexInput = indexInput.trim();
    if (Utility.isEmptyString(indexInput)) {
      console.log('ERROR: Please enter an integer index to access the validation Misclassified entry');
      return -3;
    }
    if (Number.isInteger(Number(indexInput))) {
      const index: number = Number(indexInput);
      // eslint-disable-next-line max-depth
      if ((index < 0) || (index >= scoringMisclassifiedUtterancesSimpleArrays.length)) {
        const errorMessage: string =
          ` The index "${index}" you entered is not in range, the array length is: ${scoringMisclassifiedUtterancesSimpleArrays.length}`;
        console.log(`ERROR: ${errorMessage}`);
        return -4;
      }
      this.currentUtterance = scoringMisclassifiedUtterancesSimpleArrays[index][0];
      this.currentIntentLabels = scoringMisclassifiedUtterancesSimpleArrays[index][1].split(',');
    } else {
      console.log('ERROR: Please enter an integer index to access the validation Misclassified entry');
      return -5;
    }
    return 0;
  }

  public async commandLetVL(): Promise<number> {
    if (!this.currentEvaluationOutput) {
      console.log('ERROR: There is no validation report, please use the "v" command to create one');
      return -1;
    }
    const labelUtterancesTotal: number =
    this.currentEvaluationOutput.evaluationReportLabelUtteranceStatistics.labelStatisticsAndHtmlTable.labelUtterancesTotal;
    if (labelUtterancesTotal <= 0) {
      console.log('ERROR: There is no examples or there is no validation report, please use the "v" command to create one');
      return -2;
    }
    const scoringLowConfidenceUtterancesSimpleArrays: string[][] =
    this.currentEvaluationOutput.evaluationReportAnalyses.lowConfidenceAnalysis.scoringLowConfidenceUtterancesSimpleArrays;
    // eslint-disable-next-line no-await-in-loop
    const questionForUtteranceLabelsFromLowConfidence: string =
      'Please enter an index from the LowConfidence report > ';
    let indexInput: string = await OrchestratorPredict.question(questionForUtteranceLabelsFromLowConfidence);
    indexInput = indexInput.trim();
    if (Utility.isEmptyString(indexInput)) {
      console.log('ERROR: Please enter an integer index to access the validation LowConfidence entry');
      return -3;
    }
    if (Number.isInteger(Number(indexInput))) {
      const index: number = Number(indexInput);
      // eslint-disable-next-line max-depth
      if ((index < 0) || (index >= scoringLowConfidenceUtterancesSimpleArrays.length)) {
        const errorMessage: string =
          ` The index "${index}" you entered is not in range, the array length is: ${scoringLowConfidenceUtterancesSimpleArrays.length}`;
        console.log(`ERROR: ${errorMessage}`);
        return -4;
      }
      this.currentUtterance = scoringLowConfidenceUtterancesSimpleArrays[index][0];
      this.currentIntentLabels = scoringLowConfidenceUtterancesSimpleArrays[index][1].split(',');
    } else {
      console.log('ERROR: Please enter an integer index to access the validation LowConfidence entry');
      return -5;
    }
    return 0;
  }

  public async commandLetVAT(): Promise<number> {
    const ambiguousClosenessParameter: string = await OrchestratorPredict.question(OrchestratorPredict.questionForAmbiguousThreshold);
    const ambiguousCloseness: number = Number(ambiguousClosenessParameter);
    if (Number.isNaN(ambiguousCloseness)) {
      Utility.debuggingLog(`The input "${ambiguousClosenessParameter}" is not a number.`);
      return -1;
    }
    this.ambiguousCloseness = ambiguousCloseness;
    return 0;
  }

  public async commandLetVLT(): Promise<number> {
    const lowConfidenceScoreThresholdParameter: string = await OrchestratorPredict.question(OrchestratorPredict.questionForLowConfidenceThreshold);
    const lowConfidenceScoreThreshold: number = Number(lowConfidenceScoreThresholdParameter);
    if (Number.isNaN(lowConfidenceScoreThreshold)) {
      Utility.debuggingLog(`The input "${lowConfidenceScoreThresholdParameter}" is not a number.`);
      return -1;
    }
    this.lowConfidenceScoreThreshold = lowConfidenceScoreThreshold;
    return 0;
  }

  public async commandLetVMT(): Promise<number> {
    const multiLabelPredictionThresholdParameter: string = await OrchestratorPredict.question(OrchestratorPredict.questionForAmbiguousThreshold);
    const multiLabelPredictionThreshold: number = Number(multiLabelPredictionThresholdParameter);
    if (Number.isNaN(multiLabelPredictionThreshold)) {
      Utility.debuggingLog(`The input "${multiLabelPredictionThresholdParameter}" is not a number.`);
      return -1;
    }
    this.multiLabelPredictionThreshold = multiLabelPredictionThreshold;
    return 0;
  }

  public async commandLetVUT(): Promise<number> {
    const unknownLabelPredictionThresholdParameter: string = await OrchestratorPredict.question(OrchestratorPredict.questionForLowConfidenceThreshold);
    const unknownLabelPredictionThreshold: number = Number(unknownLabelPredictionThresholdParameter);
    if (Number.isNaN(unknownLabelPredictionThreshold)) {
      Utility.debuggingLog(`The input "${unknownLabelPredictionThresholdParameter}" is not a number.`);
      return -1;
    }
    this.unknownLabelPredictionThreshold = unknownLabelPredictionThreshold;
    return 0;
  }

  public commandLetA(): number {
    const example: Example = Example.newIntentExample(
      this.currentUtterance,
      this.currentIntentLabels);
    const exampleObejct: any = example.toObject();
    Utility.debuggingLog(`exampleObejct=${Utility.jsonStringify(exampleObejct)}`);
    const rvAddExample: any = this.labelResolver.addExample(exampleObejct);
    Utility.debuggingLog(`rv=${rvAddExample}`);
    if (!rvAddExample) {
      console.log(`ERROR: There is an error, the example was not added, example: ${Utility.jsonStringify(exampleObejct)}`);
      return -1;
    }
    console.log(`> Utterance '${this.currentUtterance}' has been added to '${Utility.jsonStringify(this.currentIntentLabels)}'`);
    return 0;
  }

  public commandLetR(): number {
    const example: Example = Example.newIntentExample(
      this.currentUtterance,
      this.currentIntentLabels);
    const exampleObejct: any = example.toObject();
    Utility.debuggingLog(`exampleObejct=${Utility.jsonStringify(exampleObejct)}`);
    const rvRemoveExample: any = this.labelResolver.removeExample(exampleObejct);
    Utility.debuggingLog(`rv=${rvRemoveExample}`);
    if (!rvRemoveExample) {
      console.log(`ERROR: There is an error, the example was not removed, example: ${Utility.jsonStringify(exampleObejct)}`);
      return -1;
    }
    console.log(`> Utterance '${this.currentUtterance}' has been removed from '${Utility.jsonStringify(this.currentIntentLabels)}'`);
    return 0;
  }

  public commandLetC(): number {
    const exampleToRemove: Example = Example.newIntentExample(
      this.currentUtterance,
      this.currentIntentLabels);
    const exampleObejctToRemove: any = exampleToRemove.toObject();
    Utility.debuggingLog(`exampleObejctToRemove=${Utility.jsonStringify(exampleObejctToRemove)}`);
    const rvRemoveExample: any = this.labelResolver.removeExample(exampleObejctToRemove);
    Utility.debuggingLog(`rvRemoveExample=${rvRemoveExample}`);
    if (!rvRemoveExample) {
      console.log(`ERROR: There is an error, the example was not removed, example: ${Utility.jsonStringify(exampleObejctToRemove)}`);
      return -1;
    }
    const exampleToAdd: Example = Example.newIntentExample(
      this.currentUtterance,
      this.newIntentLabels);
    const exampleObejctToAdd: any = exampleToAdd.toObject();
    Utility.debuggingLog(`exampleObejctToAdd=${Utility.jsonStringify(exampleObejctToAdd)}`);
    const rvAddExample: any = this.labelResolver.addExample(exampleObejctToAdd);
    Utility.debuggingLog(`rvAddExample=${rvAddExample}`);
    if (!rvAddExample) {
      console.log(`ERROR: There is an error, the example was not added, example: ${Utility.jsonStringify(exampleObejctToAdd)}`);
      return -2;
    }
    console.log(`> Utterance '${this.currentUtterance}' has been moved from '${Utility.jsonStringify(this.currentIntentLabels)}' to '${Utility.jsonStringify(this.newIntentLabels)}'`);
    return 0;
  }

  public commandLetRL(): number {
    if (Utility.isEmptyStringArray(this.currentIntentLabels)) {
      console.log('ERROR: "Current" intent label array is empty.');
      return -1;
    }
    for (const label of this.currentIntentLabels) {
      const rvRemoveLabel: any = this.labelResolver.removeLabel(label);
      if (!rvRemoveLabel) {
        console.log(`ERROR: Failed to remove label: '${label}'`);
        return -1;
      }
    }
    console.log(`> Labels '${this.currentIntentLabels}' have been removed from the model.`);
    return 0;
  }

  public commandLetN(): number {
    const snapshot: any = this.labelResolver.createSnapshot();
    OrchestratorHelper.writeToFile(this.trainingFileOutput, snapshot);
    Utility.debuggingLog(`Snapshot written to ${this.trainingFileOutput}`);
    console.log(`> A new snapshot has been saved to '${this.trainingFileOutput}'`);
    return 0;
  }
}
