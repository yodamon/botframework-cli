/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class Utility {
  public static toPrintDebuggingLogToConsole: boolean = true;

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

  public static countMapValues(inputStringToStringArrayMap: { [id: string]: string[]; }): number {
    return Object.entries(inputStringToStringArrayMap).reduce(
        (accumulant: number,  [id, value]) => accumulant += value.length, 0);
  }

  public static jsonstringify(input: any): string {
    return JSON.stringify(input, null, 4);
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
