/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as fs from 'fs';

export class Utility {
  public static toPrintDebuggingLogToConsole: boolean = true;

  public static toPrintDetailedDebuggingLogToConsole: boolean = false;

  public static evaluateMultiLabelPrediction(groundTruths: any[], predictions: any[]): number {
    if (predictions.length <= 0) {
      if (groundTruths.length <= 0) {
        return 3; // ---- NOTE ---- 3 for true negative as there is no prediction on an empty ground-truth set.
      }
      return 1; // ---- NOTE ---- 1 for false negative as there is no prediction on a non-empty ground-truth set.
    }
    for (const prediction of predictions) {
      if (!groundTruths.includes(prediction)) {
        return 2; // ---- NOTE ---- 2 for false positive as there is a prediction not in the ground-truth set.
      }
    }
    return 0; // ---- NOTE ---- 0 for true positive as every prediction is in the ground-trueh set.
  }

  public static reverseUniqueKeyedArray(input: {[id: string]: string[]}): {[id: string]: string[]} {
    const reversed: {[id: string]: string[]} = {};
    for (const key in input) {
      if (key) {
        const keyedArray: string[] = input[key];
        for (const keyedArrayElement of keyedArray) {
          if (keyedArrayElement in reversed) {
            reversed[keyedArrayElement].push(key);
          } else {
            reversed[keyedArrayElement] = [key];
          }
        }
      }
    }
    return reversed;
  }

  // eslint-disable-next-line max-params
  public static storeDataArraysToTsvFile(
    outputFilename: string,
    outputEvaluationReportDataArrays: string[][],
    outputDataArraryHeaders: string[] = [],
    columnDelimiter: string = '\t',
    recordDelimiter: string = '\n',
    encoding: string = 'utf8'): string {
    if (Utility.isEmptyString(outputFilename)) {
      Utility.debuggingThrow(
        'outputFilename is empty');
    }
    if (Utility.isEmptyStringArrays(outputEvaluationReportDataArrays)) {
      Utility.debuggingThrow(
        'outputEvaluationReportDataArrays is empty');
    }
    const outputLines: string[] = [];
    if (!Utility.isEmptyStringArray(outputDataArraryHeaders)) {
      const outputLine: string = outputDataArraryHeaders.join(columnDelimiter);
      outputLines.push(outputLine);
    }
    for (const outputEvaluationReportDataArray of outputEvaluationReportDataArrays) {
      const outputLine: string = outputEvaluationReportDataArray.join(columnDelimiter);
      outputLines.push(outputLine);
    }
    const outputContent: string = outputLines.join(recordDelimiter);
    try {
      return Utility.dumpFile(outputFilename, `${outputContent}${recordDelimiter}`, encoding);
    } catch (error) {
      Utility.debuggingThrow(
        `storeTsvFile() cannout create an output file: ${outputFilename}, EXCEPTION=${error}`);
      return '';
    }
  }

  // eslint-disable-next-line max-params
  public static convertDataArraysToHtmlTable(
    tableDescription: string,
    outputEvaluationReportDataArrays: any[][],
    outputDataArraryHeaders: string[] = [],
    indentCumulative: string = '  ',
    indent: string = '  '): string {
    const outputLines: string[] = [];
    if (Utility.isEmptyStringArrays(outputEvaluationReportDataArrays)) {
      Utility.debuggingThrow(
        'outputEvaluationReportDataArrays is empty');
    }
    if (!Utility.isEmptyString(tableDescription)) {
      outputLines.push(indentCumulative + `<p><strong>${tableDescription}</strong></p>`);
    }
    outputLines.push(indentCumulative + '<table class="table">');
    if (!Utility.isEmptyStringArray(outputDataArraryHeaders)) {
      outputLines.push(indentCumulative + indent + '<tr>');
      for (const headerEntry of outputDataArraryHeaders) {
        outputLines.push(indentCumulative + indent + indent + '<th>');
        outputLines.push(indentCumulative + indent + indent + headerEntry);
        outputLines.push(indentCumulative + indent + indent + '</th>');
      }
      outputLines.push(indentCumulative + indent + '<tr>');
    }
    for (const outputEvaluationReportDataArray of outputEvaluationReportDataArrays) {
      outputLines.push(indentCumulative + indent + '<tr>');
      for (const dataEntry of outputEvaluationReportDataArray) {
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + dataEntry);
        outputLines.push(indentCumulative + indent + indent + '</td>');
      }
      outputLines.push(indentCumulative + indent + '</tr>');
    }
    outputLines.push(indentCumulative + '</table>');
    const outputContent: string = outputLines.join('\n');
    return outputContent;
  }

  // eslint-disable-next-line max-params
  public static convertDataArraysToIndexedHtmlTable(
    tableDescription: string,
    outputEvaluationReportDataArrays: any[][],
    outputDataArraryHeaders: string[] = [],
    indentCumulative: string = '  ',
    indent: string = '  '): string {
    const outputLines: string[] = [];
    if (Utility.isEmptyStringArrays(outputEvaluationReportDataArrays)) {
      Utility.debuggingThrow(
        'outputEvaluationReportDataArrays is empty');
    }
    if (!Utility.isEmptyString(tableDescription)) {
      outputLines.push(indentCumulative + `<p><strong>${tableDescription}</strong></p>`);
    }
    outputLines.push(indentCumulative + '<table class="table">');
    if (!Utility.isEmptyStringArray(outputDataArraryHeaders)) {
      outputLines.push(indentCumulative + indent + '<tr>');
      outputLines.push(indentCumulative + indent + indent + '<th>');
      outputLines.push(indentCumulative + indent + indent + 'No');
      outputLines.push(indentCumulative + indent + indent + '</th>');
      for (const headerEntry of outputDataArraryHeaders) {
        outputLines.push(indentCumulative + indent + indent + '<th>');
        outputLines.push(indentCumulative + indent + indent + headerEntry);
        outputLines.push(indentCumulative + indent + indent + '</th>');
      }
      outputLines.push(indentCumulative + indent + '<tr>');
    }
    let index: number = 0;
    for (const outputEvaluationReportDataArray of outputEvaluationReportDataArrays) {
      outputLines.push(indentCumulative + indent + '<tr>');
      outputLines.push(indentCumulative + indent + indent + '<td>');
      outputLines.push(indentCumulative + indent + indent + index++);
      outputLines.push(indentCumulative + indent + indent + '</td>');
      for (const dataEntry of outputEvaluationReportDataArray) {
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + dataEntry);
        outputLines.push(indentCumulative + indent + indent + '</td>');
      }
      outputLines.push(indentCumulative + indent + '</tr>');
    }
    outputLines.push(indentCumulative + '</table>');
    const outputContent: string = outputLines.join('\n');
    return outputContent;
  }

  // eslint-disable-next-line max-params
  public static convertMapSetToIndexedHtmlTable(
    tableDescription: string,
    outputEvaluationMapSet: Map<any, Set<any>>,
    outputDataArraryHeaders: string[] = [],
    indentCumulative: string = '  ',
    indent: string = '  '): string {
    const outputLines: string[] = [];
    if (outputEvaluationMapSet === null) {
      Utility.debuggingThrow(
        'outputEvaluationMapSet is empty');
    }
    if (!Utility.isEmptyString(tableDescription)) {
      outputLines.push(indentCumulative + `<p><strong>${tableDescription}</strong></p>`);
    }
    outputLines.push(indentCumulative + '<table class="table">');
    if (!Utility.isEmptyStringArray(outputDataArraryHeaders)) {
      outputLines.push(indentCumulative + indent + '<tr>');
      outputLines.push(indentCumulative + indent + indent + '<th>');
      outputLines.push(indentCumulative + indent + indent + 'No');
      outputLines.push(indentCumulative + indent + indent + '</th>');
      for (const headerEntry of outputDataArraryHeaders) {
        outputLines.push(indentCumulative + indent + indent + '<th>');
        outputLines.push(indentCumulative + indent + indent + headerEntry);
        outputLines.push(indentCumulative + indent + indent + '</th>');
      }
      outputLines.push(indentCumulative + indent + '<tr>');
    }
    let index: number = 0;
    for (const outputEvaluationMapSetEntry of outputEvaluationMapSet) {
      const key: any = outputEvaluationMapSetEntry[0];
      for (const valueSetEntry of outputEvaluationMapSetEntry[1]) {
        outputLines.push(indentCumulative + indent + '<tr>');
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + index++);
        outputLines.push(indentCumulative + indent + indent + '</td>');
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + key);
        outputLines.push(indentCumulative + indent + indent + '</td>');
        outputLines.push(indentCumulative + indent + indent + '<td>');
        outputLines.push(indentCumulative + indent + indent + valueSetEntry);
        outputLines.push(indentCumulative + indent + indent + '</td>');
        outputLines.push(indentCumulative + indent + '</tr>');
      }
    }
    outputLines.push(indentCumulative + '</table>');
    const outputContent: string = outputLines.join('\n');
    return outputContent;
  }

  public static getIndexesOnMaxEntries(
    inputArray: number[]):
    { 'indexesMax': number[]; 'max': number } {
    if (Utility.isEmptyNumberArray(inputArray)) {
      Utility.debuggingThrow('inputArray is empty');
    }
    let indexesMax: number[] = [0];
    let max: number = inputArray[0];
    for (let i: number = 1; i < inputArray.length; i++) {
      const inputCurrent: number = inputArray[i];
      if (inputCurrent > max) {
        max = inputCurrent;
        indexesMax = [i];
        continue;
      }
      if (inputCurrent === max) {
        indexesMax.push(i);
      }
    }
    return {indexesMax, max};
  }

  public static getIndexOnFirstMaxEntry(
    inputArray: number[]):
    { 'indexMax': number; 'max': number } {
    if (Utility.isEmptyNumberArray(inputArray)) {
      Utility.debuggingThrow('inputArray is empty');
    }
    let indexMax: number = 0;
    let max: number = inputArray[0];
    for (let i: number = 1; i < inputArray.length; i++) {
      const inputCurrent: number = inputArray[i];
      if (inputCurrent > max) {
        max = inputCurrent;
        indexMax = i;
      }
    }
    return {indexMax, max};
  }

  public static isEmptyNumberArrays(inputArrays: number[][]): boolean {
    return !(inputArrays && inputArrays.length > 0);
  }

  public static isEmptyStringArrays(inputArrays: string[][]): boolean {
    return !(inputArrays && inputArrays.length > 0);
  }

  public static isEmptyNumberArray(inputArray: number[]): boolean {
    return !(inputArray && inputArray.length > 0);
  }

  public static isEmptyStringArray(inputArray: string[]): boolean {
    return !(inputArray && inputArray.length > 0);
  }

  public static isEmptyArray(inputArray: object[]): boolean {
    return !(inputArray && inputArray.length > 0);
  }

  public static isEmptyString(input: string): boolean {
    return !(input && input.length > 0);
  }

  public static scoreResultsToArray(results: any, labelIndexMap: {[id: string]: number}, digits: number = 10000): {
    'label': string;
    'score': number;
    'closest_text': string;
    'label_type': number;
    'label_span_offset': number;
    'label_span_length': number; }[] {
    const scoreResultArray: {
      'label': string;
      'score': number;
      'closest_text': string;
      'label_type': number;
      'label_span_offset': number;
      'label_span_length': number; }[] = [];
    for (const result of results) {
      if (result) {
        let score: number = result.score;
        if (digits > 0) {
          score = Math.round(score * digits) / digits;
        }
        const result_label: any = result.label;
        const label: string = result_label.name;
        const label_type: number = result_label.label_type;
        const label_span: any = result_label.span;
        const label_span_offset: number = label_span.offset;
        const label_span_length: number = label_span.length;
        const closest_text: string = result.closest_text;
        const scoreResult: {
          'label': string;
          'score': number;
          'closest_text': string;
          'label_type': number;
          'label_span_offset': number;
          'label_span_length': number; } = {
            label,
            score,
            closest_text,
            label_type,
            label_span_offset,
            label_span_length};
        const labelIndex: number = labelIndexMap[label];
        if (labelIndex >= 0) {
          scoreResultArray[labelIndex] = scoreResult;
        }
      }
    }
    return scoreResultArray;
  }

  public static buildStringIdNumberValueDictionaryFromUniqueStringArray(
    inputStringArray: string[]): {[id: string]: number} {
    const stringMap: {[id: string]: number} = { };
    for (let index: number = 0; index < inputStringArray.length; index++) {
      stringMap[inputStringArray[index]] = index;
    }
    return stringMap;
  }

  public static buildStringIdNumberValueDictionaryFromStringArray(
    inputStringArray: string[]): {
      'stringArray': string[];
      'stringMap': {[id: string]: number};} {
    const stringSet: Set<string> = new Set(inputStringArray);
    const stringArray: string[] = [...stringSet.values()];
    const stringMap: {[id: string]: number} =
      Utility.buildStringIdNumberValueDictionaryFromUniqueStringArray(stringArray);
    return {stringArray, stringMap};
  }

  public static buildStringIdNumberValueDictionaryFromStringArrays(
    inputStringArrays: string[][]): {
      'stringArray': string[];
      'stringMap': {[id: string]: number}; } {
    const stringSet: Set<string> = new Set();
    for (const elementStringArray of inputStringArrays) {
      for (const elementString of elementStringArray) {
        stringSet.add(elementString);
      }
    }
    const stringArray: string[] = [...stringSet.values()];
    const stringMap: {[id: string]: number} =
      Utility.buildStringIdNumberValueDictionaryFromUniqueStringArray(stringArray);
    return {stringArray, stringMap};
  }

  public static convertStringKeyGenericSetNativeMapToDictionary<T>(
    stringKeyGenericSetMap: Map<string, Set<T>>): { [id: string]: Set<T> } {
    const stringIdGenericSetDictionary: { [id: string]: Set<T> } = {};
    for (const key in stringKeyGenericSetMap) {
      if (key) {
        const value: Set<T> | undefined = stringKeyGenericSetMap.get(key);
        stringIdGenericSetDictionary[key] = value as Set<T>;
      }
    }
    return stringIdGenericSetDictionary;
  }

  public static convertStringKeyGenericValueValueNativeMapToDictionary<T>(
    stringKeyGenericValueMap: Map<string, T>): { [id: string]: T } {
    const stringIdGenericValueDictionary: { [id: string]: T } = {};
    for (const key in stringKeyGenericValueMap) {
      if (key) {
        const value: T | undefined = stringKeyGenericValueMap.get(key);
        stringIdGenericValueDictionary[key] = value as T;
      }
    }
    return stringIdGenericValueDictionary;
  }

  public static insertStringPairToStringIdStringSetNativeMap(
    key: string,
    value: string,
    stringKeyStringSetMap: Map<string, Set<string>>): Map<string, Set<string>> {
    if (!stringKeyStringSetMap) {
      stringKeyStringSetMap = new Map<string, Set<string>>();
    }
    if (key in stringKeyStringSetMap) {
      let stringSet: Set<string> | undefined = stringKeyStringSetMap.get(key);
      if (!stringSet) {
        stringSet = new Set<string>();
        stringKeyStringSetMap.set(key, stringSet);
      }
      stringSet.add(value);
    } else {
      const stringSet: Set<string> = new Set<string>();
      stringKeyStringSetMap.set(key, stringSet);
      stringSet.add(value);
    }
    return stringKeyStringSetMap;
  }

  public static countMapValues(inputStringToStringArrayMap: { [id: string]: string[] }): number {
    return Object.entries(inputStringToStringArrayMap).reduce(
      (accumulant: number,  value: [string, string[]]) => accumulant + value[1].length, 0);
  }

  public static jsonstringify(input: any): string {
    return JSON.stringify(input, null, 4);
  }

  public static loadFile(
    filename: string,
    encoding: string = 'utf8'): string {
    Utility.debuggingLog(
      `Utility.loadFile(): filename=${filename}`);
    Utility.debuggingLog(
      `Utility.loadFile(): process.cmd()=${process.cwd()}`);
    try {
      const fileContent: string = fs.readFileSync(filename, encoding);
      return fileContent;
    } catch (error) {
      Utility.debuggingThrow(
        `Utility.loadFile(): filename=${filename}, exception=${error}`);
    }
    return '';
  }

  public static dumpFile(
    filename: string,
    content: any,
    encoding: string = 'utf8'): string {
    // Utility.debuggingLog(
    //     `Utility.dumpFile(): filename=${filename}`);
    try {
      fs.writeFileSync(filename, content, encoding);
    } catch (error) {
      // ---- NOTE ---- An error occurred
      Utility.debuggingThrow(`FAILED to dump a file: filename=${filename}, exception=${error}`);
      return '';
    }
    return filename;
  }

  public static exists(pathToFileSystemEntry: string): boolean {
    return fs.existsSync(pathToFileSystemEntry);
  }

  public static writeToConsole(outputContents: string) {
    const output: string = JSON.stringify(outputContents, null, 2);
    process.stdout.write(`${output}\n`);
  }

  public static debuggingLog(
    message: any): string {
    const dateTimeString: string = (new Date()).toISOString();
    const logMessage: string = `[${dateTimeString}] LOG-MESSAGE: ${message}`;
    if (Utility.toPrintDebuggingLogToConsole) {
      // eslint-disable-next-line no-console
      console.log(logMessage);
    }
    return logMessage;
  }

  public static debuggingThrow(
    message: any): void {
    const dateTimeString: string = (new Date()).toISOString();
    const logMessage: string = `[${dateTimeString}] ERROR-MESSAGE: ${message}`;
    throw new Error(Utility.jsonstringify(logMessage));
  }
}
