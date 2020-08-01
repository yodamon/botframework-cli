/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IConfusionMatrix } from "./IConfusionMatrix";
import { BinaryConfusionMatrix } from "./BinaryConfusionMatrix";

import { DictionaryMapUtility } from "../../data_structure/DictionaryMapUtility";

import { Utility } from "../../utility/Utility";

export abstract class ConfusionMatrixBase implements IConfusionMatrix {

    protected labels: string[] = [];
    protected labelMap: { [id: string]: number } = {};

    constructor(
        labels: string[],
        labelMap: { [id: string]: number }) {
        this.resetLabelsAndMap(labels, labelMap);
    }

    public abstract reset(): void;

    public generateConfusionMatrixMetricStructure(): {
        "confusionMatrix": IConfusionMatrix,
        "labelBinaryConfusionMatrixBasicMetricMap": { [id: string]: { [id: string]: number } },
        "labelBinaryConfusionMatrixMap": { [id: string]: BinaryConfusionMatrix },
        "microAverageMetrics": {
            "accuracy": number,
            "truePositives": number,
            "falsePositives": number,
            "falseNegatives": number,
            "support": number },
        "macroAverageMetrics": {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "support": number },
        "positiveSupportLabelMacroAverageMetrics": {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "support": number },
        "weightedMacroAverageMetrics": {
            "weightedAveragePrecision": number,
            "weightedAverageRecall": number,
            "weightedAverageF1Score": number,
            "weightedAverageAccuracy": number,
            "weightedAverageSupport": number,
            "support": number },
        "sumupWeightedMacroAverageMetricArray": {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "total": number } } {
        const confusionMatrix: IConfusionMatrix = this;
        const crossValidationBinaryConfusionMatrix: BinaryConfusionMatrix[] =
            confusionMatrix.getBinaryConfusionMatrices();
        const labelMap: { [id: string]: number } =
            confusionMatrix.getLabelMap();
        const labelBinaryConfusionMatrixBasicMetricMap: { [id: string]: { [id: string]: number } } =
            Object.entries(labelMap).reduce(
                (accumulant: { [id: string]: { [id: string]: number } }, [id, value]) =>
                ({...accumulant, [id]: crossValidationBinaryConfusionMatrix[value].getBasicMetrics()}), {});
        const labelBinaryConfusionMatrixMap: { [id: string]: BinaryConfusionMatrix } =
            Object.entries(labelMap).reduce(
                (accumulant: { [id: string]: BinaryConfusionMatrix }, [id, value]) =>
                ({...accumulant, [id]: crossValidationBinaryConfusionMatrix[value]}), {});
        const binaryConfusionMatrices: BinaryConfusionMatrix[] =
            confusionMatrix.getBinaryConfusionMatrices();
        const microAverageMetricArray: {
            "averagePrecisionRecallF1Accuracy": number,
            "truePositives": number,
            "falsePositives": number,
            "falseNegatives": number,
            "total": number } =
            confusionMatrix.getMicroAverageMetrics(binaryConfusionMatrices);
        const accuracy: number =
            microAverageMetricArray.averagePrecisionRecallF1Accuracy;
        const truePositives: number =
            microAverageMetricArray.truePositives;
        const falsePositives: number =
            microAverageMetricArray.falsePositives;
        const falseNegatives: number =
            microAverageMetricArray.falseNegatives;
        const supportMicroAverage: number =
            microAverageMetricArray.total;
        const microAverageMetrics: {
            "accuracy": number,
            "truePositives": number,
            "falsePositives": number,
            "falseNegatives": number,
            "support": number } = {
            // tslint:disable-next-line: object-literal-key-quotes
            "accuracy": accuracy,
            // tslint:disable-next-line: object-literal-key-quotes
            "truePositives": truePositives,
            // tslint:disable-next-line: object-literal-key-quotes
            "falsePositives": falsePositives,
            // tslint:disable-next-line: object-literal-key-quotes
            "falseNegatives": falseNegatives,
            // tslint:disable-next-line: object-literal-key-quotes
            "support": supportMicroAverage };
        const macroAverageMetricArray: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "total": number } =
            confusionMatrix.getMacroAverageMetrics(binaryConfusionMatrices);
        const averagePrecision: number =
            macroAverageMetricArray.averagePrecision;
        const averageRecall: number =
            macroAverageMetricArray.averageRecall;
        const averageF1Score: number =
            macroAverageMetricArray.averageF1Score;
        const averageAccuracy: number =
            macroAverageMetricArray.averageAccuracy;
        const averageTruePositives: number =
            macroAverageMetricArray.averageTruePositives;
        const averageFalsePositives: number =
            macroAverageMetricArray.averageFalsePositives;
        const averageTrueNegatives: number =
            macroAverageMetricArray.averageTrueNegatives;
        const averageFalseNegatives: number =
            macroAverageMetricArray.averageFalseNegatives;
        const averageSupport: number =
            macroAverageMetricArray.averageSupport;
        const supportMacroAverage: number =
            macroAverageMetricArray.total;
        const macroAverageMetrics: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "support": number } = {
            // tslint:disable-next-line: object-literal-key-quotes
            "averagePrecision": averagePrecision,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageRecall": averageRecall,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageF1Score": averageF1Score,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageAccuracy": averageAccuracy,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageTruePositives": averageTruePositives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageFalsePositives": averageFalsePositives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageTrueNegatives": averageTrueNegatives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageFalseNegatives": averageFalseNegatives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageSupport": averageSupport,
            // tslint:disable-next-line: object-literal-key-quotes
            "support": supportMacroAverage };
        const positiveSupportLabelMacroAverageMetricArray: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "total": number } =
            confusionMatrix.getPositiveSupportLabelMacroAverageMetrics(binaryConfusionMatrices);
        const positiveSupportLabelAveragePrecision: number =
            positiveSupportLabelMacroAverageMetricArray.averagePrecision;
        const positiveSupportLabelAverageRecall: number =
            positiveSupportLabelMacroAverageMetricArray.averageRecall;
        const positiveSupportLabelAverageF1Score: number =
            positiveSupportLabelMacroAverageMetricArray.averageF1Score;
        const positiveSupportLabelAverageAccuracy: number =
            positiveSupportLabelMacroAverageMetricArray.averageAccuracy;
        const positiveSupportLabelAverageTruePositives: number =
            positiveSupportLabelMacroAverageMetricArray.averageTruePositives;
        const positiveSupportLabelAverageFalsePositives: number =
            positiveSupportLabelMacroAverageMetricArray.averageFalsePositives;
        const positiveSupportLabelAverageTrueNegatives: number =
            positiveSupportLabelMacroAverageMetricArray.averageTrueNegatives;
        const positiveSupportLabelAverageFalseNegatives: number =
            positiveSupportLabelMacroAverageMetricArray.averageFalseNegatives;
        const positiveSupportLabelAverageSupport: number =
            positiveSupportLabelMacroAverageMetricArray.averageSupport;
        const positiveSupportLabelSupportMacroAverage: number =
            positiveSupportLabelMacroAverageMetricArray.total;
        const positiveSupportLabelMacroAverageMetrics: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "support": number } = {
            // tslint:disable-next-line: object-literal-key-quotes
            "averagePrecision": positiveSupportLabelAveragePrecision,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageRecall": positiveSupportLabelAverageRecall,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageF1Score": positiveSupportLabelAverageF1Score,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageAccuracy": positiveSupportLabelAverageAccuracy,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageTruePositives": positiveSupportLabelAverageTruePositives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageFalsePositives": positiveSupportLabelAverageFalsePositives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageTrueNegatives": positiveSupportLabelAverageTrueNegatives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageFalseNegatives": positiveSupportLabelAverageFalseNegatives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageSupport": positiveSupportLabelAverageSupport,
            // tslint:disable-next-line: object-literal-key-quotes
            "support": positiveSupportLabelSupportMacroAverage };
        const weightedMacroAverageMetricArray: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageSupport": number,
            "total": number } =
            confusionMatrix.getWeightedMacroAverageMetrics(binaryConfusionMatrices);
        const weightedAveragePrecision: number =
            weightedMacroAverageMetricArray.averagePrecision;
        const weightedAverageRecall: number =
            weightedMacroAverageMetricArray.averageRecall;
        const weightedAverageF1Score: number =
            weightedMacroAverageMetricArray.averageF1Score;
        const weightedAverageAccuracy: number =
            weightedMacroAverageMetricArray.averageAccuracy;
        const weightedAverageSupport: number =
            weightedMacroAverageMetricArray.averageSupport;
        const supportWeightedMacroAverage: number =
            weightedMacroAverageMetricArray.total;
        const weightedMacroAverageMetrics: {
            "weightedAveragePrecision": number,
            "weightedAverageRecall": number,
            "weightedAverageF1Score": number,
            "weightedAverageAccuracy": number,
            "weightedAverageSupport": number,
            "support": number } = {
            // tslint:disable-next-line: object-literal-key-quotes
            "weightedAveragePrecision": weightedAveragePrecision,
            // tslint:disable-next-line: object-literal-key-quotes
            "weightedAverageRecall": weightedAverageRecall,
            // tslint:disable-next-line: object-literal-key-quotes
            "weightedAverageF1Score": weightedAverageF1Score,
            // tslint:disable-next-line: object-literal-key-quotes
            "weightedAverageAccuracy": weightedAverageAccuracy,
            // tslint:disable-next-line: object-literal-key-quotes
            "weightedAverageSupport": weightedAverageSupport,
            // tslint:disable-next-line: object-literal-key-quotes
            "support": supportWeightedMacroAverage };
        const sumupWeightedMacroAverageMetricArray: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "total": number } =
            confusionMatrix.getSumupWeightedMacroAverageMetrics(binaryConfusionMatrices);
        const sumupWeightedAveragePrecision: number =
            sumupWeightedMacroAverageMetricArray.averagePrecision;
        const sumupWeightedAverageRecall: number =
            sumupWeightedMacroAverageMetricArray.averageRecall;
        const sumupWeightedAverageF1Score: number =
            sumupWeightedMacroAverageMetricArray.averageF1Score;
        const sumupWeightedAverageAccuracy: number =
            sumupWeightedMacroAverageMetricArray.averageAccuracy;
        const sumupWeightedAverageTruePositives: number =
            sumupWeightedMacroAverageMetricArray.averageTruePositives;
        const sumupWeightedAverageFalsePositives: number =
            sumupWeightedMacroAverageMetricArray.averageFalsePositives;
        const sumupWeightedAverageTrueNegatives: number =
            sumupWeightedMacroAverageMetricArray.averageTrueNegatives;
        const sumupWeightedAverageFalseNegatives: number =
            sumupWeightedMacroAverageMetricArray.averageFalseNegatives;
        const sumupWeightedAverageSupport: number =
            sumupWeightedMacroAverageMetricArray.averageSupport;
        const sumupWeightedSupportMacroAverage: number =
            sumupWeightedMacroAverageMetricArray.total;
        const sumupWeightedMacroAverageMetrics: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageSupport": number,
            "support": number } = {
            // tslint:disable-next-line: object-literal-key-quotes
            "averagePrecision": sumupWeightedAveragePrecision,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageRecall": sumupWeightedAverageRecall,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageF1Score": sumupWeightedAverageF1Score,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageAccuracy": sumupWeightedAverageAccuracy,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageTruePositives": sumupWeightedAverageTruePositives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageFalsePositives": sumupWeightedAverageFalsePositives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageTrueNegatives": sumupWeightedAverageTrueNegatives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageFalseNegatives": sumupWeightedAverageFalseNegatives,
            // tslint:disable-next-line: object-literal-key-quotes
            "averageSupport": sumupWeightedAverageSupport,
            // tslint:disable-next-line: object-literal-key-quotes
            "support": sumupWeightedSupportMacroAverage };
        const confusionMatrixMetricStructure: {
            "confusionMatrix": IConfusionMatrix,
            "labelBinaryConfusionMatrixBasicMetricMap": { [id: string]: { [id: string]: number } },
            "labelBinaryConfusionMatrixMap": { [id: string]: BinaryConfusionMatrix },
            "microAverageMetrics": {
                "accuracy": number,
                "truePositives": number,
                "falsePositives": number,
                "falseNegatives": number,
                "support": number },
            "macroAverageMetrics": {
                "averagePrecision": number,
                "averageRecall": number,
                "averageF1Score": number,
                "averageAccuracy": number,
                "averageTruePositives": number,
                "averageFalsePositives": number,
                "averageTrueNegatives": number,
                "averageFalseNegatives": number,
                "averageSupport": number,
                "support": number },
            "positiveSupportLabelMacroAverageMetrics": {
                "averagePrecision": number,
                "averageRecall": number,
                "averageF1Score": number,
                "averageAccuracy": number,
                "averageTruePositives": number,
                "averageFalsePositives": number,
                "averageTrueNegatives": number,
                "averageFalseNegatives": number,
                "averageSupport": number,
                "support": number },
            "weightedMacroAverageMetrics": {
                "weightedAveragePrecision": number,
                "weightedAverageRecall": number,
                "weightedAverageF1Score": number,
                "weightedAverageAccuracy": number,
                "weightedAverageSupport": number,
                "support": number },
            "sumupWeightedMacroAverageMetricArray": {
                "averagePrecision": number,
                "averageRecall": number,
                "averageF1Score": number,
                "averageAccuracy": number,
                "averageTruePositives": number,
                "averageFalsePositives": number,
                "averageTrueNegatives": number,
                "averageFalseNegatives": number,
                "averageSupport": number,
                "total": number } } = {
            confusionMatrix,
            labelBinaryConfusionMatrixBasicMetricMap,
            labelBinaryConfusionMatrixMap,
            microAverageMetrics,
            macroAverageMetrics,
            positiveSupportLabelMacroAverageMetrics,
            weightedMacroAverageMetrics,
            sumupWeightedMacroAverageMetricArray };
        return confusionMatrixMetricStructure;
    }

    public getNumberLabels(): number {
        return this.labels.length;
    }
    public getLabels(): string[] {
        return this.labels;
    }
    public getLabelMap(): { [id: string]: number } {
        return this.labelMap;
    }

    public abstract getBinaryConfusionMatrices(): BinaryConfusionMatrix[];

    public getTotal(binaryConfusionMatrices: BinaryConfusionMatrix[] = []): number {
        if (Utility.isEmptyArray(binaryConfusionMatrices)) {
            binaryConfusionMatrices =
                this.getBinaryConfusionMatrices();
        }
        const total: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getPositives(), 0);
        return total;
    }

    public getMicroAverageMetrics(binaryConfusionMatrices: BinaryConfusionMatrix[] = []): {
        "averagePrecisionRecallF1Accuracy": number,
        "truePositives": number,
        "falsePositives": number,
        "falseNegatives": number,
        "total": number } {
        if (Utility.isEmptyArray(binaryConfusionMatrices)) {
            binaryConfusionMatrices =
                this.getBinaryConfusionMatrices();
        }
        // ---- NOTE-use-getTotal() ---- const total: number =
        // ---- NOTE-use-getTotal() ----     binaryConfusionMatrices.reduce(
        // ---- NOTE-use-getTotal() ----         (accumulation, entry) => accumulation + entry.getPositives(), 0);
        const total: number =
            this.getTotal(binaryConfusionMatrices);
        const truePositives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getTruePositives(), 0);
        const falsePositives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getFalsePositives(), 0);
        const falseNegatives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getFalseNegatives(), 0);
        const averagePrecisionRecallF1Accuracy: number =
            truePositives / total;
        const microAverageMetrics: {
            "averagePrecisionRecallF1Accuracy": number,
            "truePositives": number,
            "falsePositives": number,
            "falseNegatives": number,
            "total": number } = {
            averagePrecisionRecallF1Accuracy,
            truePositives,
            falsePositives,
            falseNegatives,
            total };
        return microAverageMetrics;
    }

    public getMacroAverageMetrics(binaryConfusionMatrices: BinaryConfusionMatrix[] = []): {
        "averagePrecision": number,
        "averageRecall": number,
        "averageF1Score": number,
        "averageTruePositives": number,
        "averageFalsePositives": number,
        "averageTrueNegatives": number,
        "averageFalseNegatives": number,
        "averageAccuracy": number,
        "averageSupport": number,
        "total": number } {
        if (Utility.isEmptyArray(binaryConfusionMatrices)) {
            binaryConfusionMatrices =
                this.getBinaryConfusionMatrices();
        }
        const numberLabels: number =
            binaryConfusionMatrices.length;
        const averagePrecision: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getPrecision(), 0) / numberLabels;
        const averageRecall: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getRecall(), 0) / numberLabels;
        const averageF1Score: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getF1Score(), 0) / numberLabels;
        const averageTruePositives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getTruePositives(), 0) / numberLabels;
        const averageFalsePositives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getFalsePositives(), 0) / numberLabels;
        const averageTrueNegatives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getTrueNegatives(), 0) / numberLabels;
        const averageFalseNegatives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getFalseNegatives(), 0) / numberLabels;
        const averageAccuracy: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getAccuracy(), 0) / numberLabels;
        const averageSupport: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getSupport(), 0) / numberLabels;
        // ---- NOTE-use-getTotal() ---- const total: number =
        // ---- NOTE-use-getTotal() ----     binaryConfusionMatrices.reduce(
        // ---- NOTE-use-getTotal() ----         (accumulation, entry) => accumulation + entry.getPositives(), 0);
        const total: number =
            this.getTotal(binaryConfusionMatrices);
        const macroAverageMetrics: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageAccuracy": number,
            "averageSupport": number,
            "total": number } = {
                averagePrecision,
                averageRecall,
                averageF1Score,
                averageTruePositives,
                averageFalsePositives,
                averageTrueNegatives,
                averageFalseNegatives,
                averageAccuracy,
                averageSupport,
                total };
        return macroAverageMetrics;
    }

    public getPositiveSupportLabelMacroAverageMetrics(binaryConfusionMatrices: BinaryConfusionMatrix[] = []): {
        "averagePrecision": number,
        "averageRecall": number,
        "averageF1Score": number,
        "averageTruePositives": number,
        "averageFalsePositives": number,
        "averageTrueNegatives": number,
        "averageFalseNegatives": number,
        "averageAccuracy": number,
        "averageSupport": number,
        "total": number } {
        if (Utility.isEmptyArray(binaryConfusionMatrices)) {
            binaryConfusionMatrices =
                this.getBinaryConfusionMatrices();
        }
        const numberPositiveSupportLabels: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? 1 : 0), 0);
        const averagePrecision: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getPrecision() : 0), 0) /
                numberPositiveSupportLabels;
        const averageRecall: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getRecall() : 0), 0) /
                numberPositiveSupportLabels;
        const averageF1Score: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getF1Score() : 0), 0) /
                numberPositiveSupportLabels;
        const averageTruePositives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getTruePositives() : 0), 0) /
                numberPositiveSupportLabels;
        const averageFalsePositives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getFalsePositives() : 0), 0) /
                numberPositiveSupportLabels;
        const averageTrueNegatives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getTrueNegatives() : 0), 0) /
                numberPositiveSupportLabels;
        const averageFalseNegatives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getFalseNegatives() : 0), 0) /
                numberPositiveSupportLabels;
        const averageAccuracy: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getAccuracy() : 0), 0) /
                numberPositiveSupportLabels;
        const averageSupport: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + (entry.getSupport() > 0 ? entry.getSupport() : 0), 0) /
                numberPositiveSupportLabels;
        // ---- NOTE-use-getTotal() ---- const total: number =
        // ---- NOTE-use-getTotal() ----     binaryConfusionMatrices.reduce(
        // ---- NOTE-use-getTotal() ----         (accumulation, entry) => accumulation + entry.getPositives(), 0);
        const total: number =
            this.getTotal(binaryConfusionMatrices);
        const macroAverageMetrics: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageAccuracy": number,
            "averageSupport": number,
            "total": number } = {
                averagePrecision,
                averageRecall,
                averageF1Score,
                averageTruePositives,
                averageFalsePositives,
                averageTrueNegatives,
                averageFalseNegatives,
                averageAccuracy,
                averageSupport,
                total };
        return macroAverageMetrics;
    }

    public getWeightedMacroAverageMetrics(binaryConfusionMatrices: BinaryConfusionMatrix[] = []): {
        "averagePrecision": number,
        "averageRecall": number,
        "averageF1Score": number,
        "averageAccuracy": number,
        "averageSupport": number,
        "total": number } {
        if (Utility.isEmptyArray(binaryConfusionMatrices)) {
            binaryConfusionMatrices =
                this.getBinaryConfusionMatrices();
        }
        // ---- NOTE-use-getTotal() ---- const total: number =
        // ---- NOTE-use-getTotal() ----     binaryConfusionMatrices.reduce(
        // ---- NOTE-use-getTotal() ----         (accumulation, entry) => accumulation + entry.getPositives(), 0);
        const total: number =
            this.getTotal(binaryConfusionMatrices);
        const averagePrecision: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getPrecision() * entry.getPositives(), 0) / total;
        const averageRecall: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getRecall() * entry.getPositives(), 0) / total;
        const averageF1Score: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getF1Score() * entry.getPositives(), 0) / total;
        const averageAccuracy: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getAccuracy() * entry.getPositives(), 0) / total;
        const averageSupport: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getSupport() * entry.getPositives(), 0) / total;
        const macroAverageMetrics: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageAccuracy": number,
            "averageSupport": number,
            "total": number } = {
                averagePrecision,
                averageRecall,
                averageF1Score,
                averageAccuracy,
                averageSupport,
                total };
        return macroAverageMetrics;
    }

    public getSumupWeightedMacroAverageMetrics(binaryConfusionMatrices: BinaryConfusionMatrix[] = []): {
        "averagePrecision": number,
        "averageRecall": number,
        "averageF1Score": number,
        "averageTruePositives": number,
        "averageFalsePositives": number,
        "averageTrueNegatives": number,
        "averageFalseNegatives": number,
        "averageAccuracy": number,
        "averageSupport": number,
        "total": number } {
        if (Utility.isEmptyArray(binaryConfusionMatrices)) {
            binaryConfusionMatrices =
                this.getBinaryConfusionMatrices();
        }
        // ---- NOTE-use-getTotal() ---- const total: number =
        // ---- NOTE-use-getTotal() ----     binaryConfusionMatrices.reduce(
        // ---- NOTE-use-getTotal() ----         (accumulation, entry) => accumulation + entry.getPositives(), 0);
        const total: number =
            this.getTotal(binaryConfusionMatrices);
        const averageTruePositives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getTruePositives() * entry.getPositives(), 0) / total;
        const averageFalsePositives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getFalsePositives() * entry.getPositives(), 0) / total;
        const averageTrueNegatives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getTrueNegatives() * entry.getPositives(), 0) / total;
        const averageFalseNegatives: number =
            binaryConfusionMatrices.reduce(
                (accumulation, entry) => accumulation + entry.getFalseNegatives() * entry.getPositives(), 0) / total;
        const sumupWeightedTotal: number =
            averageTruePositives + averageFalsePositives + averageTrueNegatives + averageFalseNegatives;
        const sumupWeightedPositives: number =
            averageTruePositives + averageFalseNegatives;
        const sumupWeightedPredictedPositives: number =
            averageTruePositives + averageFalsePositives;
        const sumupWeightedBinaryConfusionMatrix: BinaryConfusionMatrix =
            new BinaryConfusionMatrix(
                sumupWeightedTotal,
                averageTruePositives,
                sumupWeightedPositives,
                sumupWeightedPredictedPositives);
        const averagePrecision: number =
            sumupWeightedBinaryConfusionMatrix.getPrecision();
        const averageRecall: number =
            sumupWeightedBinaryConfusionMatrix.getRecall();
        const averageF1Score: number =
            sumupWeightedBinaryConfusionMatrix.getF1Score();
        const averageAccuracy: number =
            sumupWeightedBinaryConfusionMatrix.getAccuracy();
        const averageSupport: number =
            sumupWeightedBinaryConfusionMatrix.getSupport();
        const macroAverageMetrics: {
            "averagePrecision": number,
            "averageRecall": number,
            "averageF1Score": number,
            "averageTruePositives": number,
            "averageFalsePositives": number,
            "averageTrueNegatives": number,
            "averageFalseNegatives": number,
            "averageAccuracy": number,
            "averageSupport": number,
            "total": number } = {
                averagePrecision,
                averageRecall,
                averageF1Score,
                averageTruePositives,
                averageFalsePositives,
                averageTrueNegatives,
                averageFalseNegatives,
                averageAccuracy,
                averageSupport,
                total };
        return macroAverageMetrics;
    }

    public validateLabelId(
        labelId: number,
        throwIfNotLegal: boolean = true): boolean {
        if (labelId < 0) {
            if (throwIfNotLegal) {
                Utility.debuggingThrow(
                    `labelId=${labelId}, small than 0`);
            }
            return false;
        }
        if (labelId >= this.getNumberLabels()) {
            if (throwIfNotLegal) {
                Utility.debuggingThrow(
                    `labelId=${labelId}, greater or equal to number of labels, ${this.getNumberLabels()}`);
            }
            return false;
        }
        return true;
    }
    public validateLabel(
        label: string,
        throwIfNotLegal: boolean = true): boolean {
        if (!(label in this.getLabelMap())) {
            if (throwIfNotLegal) {
                Utility.debuggingThrow(
                    `label=${label}, not int the label map=${Utility.jsonStringify(this.getLabelMap())}`);
            }
            return false;
        }
        return true;
    }

    protected resetLabelsAndMap(
        labels: string[],
        labelMap: { [id: string]: number }): void {
        DictionaryMapUtility.validateStringArrayAndStringIdNumberValueDictionary(labels, labelMap);
        this.labels = labels;
        this.labelMap = labelMap;
    }
}
