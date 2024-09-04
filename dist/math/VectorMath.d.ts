export declare function covarianceMatrixOfSamples(samples: number[][], weights?: number[], biased?: boolean): {
    covarianceMatrix: number[][];
    mean: number[];
};
export declare function covarianceMatrixOfCenteredSamples(centeredSamples: number[][], biased?: boolean, diagonalRegularizationAmount?: number): number[][];
export declare function weightedCovarianceMatrixOfCenteredSamples(centeredSamples: number[][], weights: number[], diagonalRegularizationAmount?: number): number[][];
export declare function centerVectors(vectors: number[][], weights?: number[]): {
    centeredVectors: number[][];
    mean: number[];
};
export declare function centerVector(vector: number[]): number[];
export declare function scaleToSumTo1(vector: number[]): number[];
export declare function normalizeVector(vector: ArrayLike<number>, kind?: 'population' | 'sample'): {
    normalizedVector: number[];
    mean: number;
    stdDeviation: number;
};
export declare function normalizeVectors(vectors: number[][], kind?: 'population' | 'sample'): {
    normalizedVectors: number[][];
    mean: number[];
    stdDeviation: number[];
};
export declare function deNormalizeVectors(normalizedVectors: number[][], originalMean: number[], originalStdDeviation: number[]): number[][];
export declare function meanOfVectors(vectors: number[][]): number[];
export declare function weightedMeanOfVectors(vectors: number[][], weights: number[]): number[];
export declare function stdDeviationOfVectors(vectors: number[][], kind?: 'population' | 'sample', mean?: number[]): number[];
export declare function varianceOfVectors(vectors: number[][], kind?: 'population' | 'sample', mean?: number[]): number[];
export declare function meanOfVector(vector: ArrayLike<number>): number;
export declare function medianOfVector(vector: ArrayLike<number>): number;
export declare function stdDeviationOfVector(vector: ArrayLike<number>, kind?: 'population' | 'sample', mean?: number): number;
export declare function varianceOfVector(vector: ArrayLike<number>, kind?: 'population' | 'sample', mean?: number): number;
export declare function logOfVector(vector: number[], minVal?: number): number[];
export declare function expOfVector(vector: number[]): number[];
export declare function transpose(matrix: number[][]): number[][];
export declare function movingAverageOfWindow3(vector: number[]): number[];
export declare function averageMeanSquaredError(actual: number[][], expected: number[][]): number;
export declare function meanSquaredError(actual: ArrayLike<number>, expected: ArrayLike<number>): number;
export declare function euclidianDistance(vector1: ArrayLike<number>, vector2: ArrayLike<number>): number;
export declare function squaredEuclidianDistance(vector1: ArrayLike<number>, vector2: ArrayLike<number>): number;
export declare function euclidianDistance13Dim(vector1: ArrayLike<number>, vector2: ArrayLike<number>): number;
export declare function squaredEuclidianDistance13Dim(vector1: ArrayLike<number>, vector2: ArrayLike<number>): number;
export declare function cosineDistance(vector1: ArrayLike<number>, vector2: ArrayLike<number>): number;
export declare function cosineSimilarity(vector1: ArrayLike<number>, vector2: ArrayLike<number>): number;
export declare function cosineDistancePrecomputedMagnitudes(vector1: ArrayLike<number>, vector2: ArrayLike<number>, magnitude1: number, magnitude2: number): number;
export declare function cosineSimilarityPrecomputedMagnitudes(vector1: ArrayLike<number>, vector2: ArrayLike<number>, magnitude1: number, magnitude2: number): number;
export declare function minkowskiDistance(vector1: ArrayLike<number>, vector2: ArrayLike<number>, power: number): number;
export declare function subtractVectors(vector1: number[], vector2: number[]): number[];
export declare function sumVector(vector: ArrayLike<number>): number;
export declare function dotProduct(vector1: ArrayLike<number>, vector2: ArrayLike<number>): number;
export declare function magnitude(vector: ArrayLike<number>): number;
export declare function maxValue(vector: ArrayLike<number>): number;
export declare function indexOfMax(vector: ArrayLike<number>): number;
export declare function minValue(vector: ArrayLike<number>): number;
export declare function indexOfMin(vector: ArrayLike<number>): number;
export declare function sigmoid(x: number): number;
export declare function softmax(logits: number[], temperature?: number): number[];
export declare function hammingDistance(value1: number, value2: number, bitLength?: number): number;
export declare function createVectorArray(vectorCount: number, featureCount: number, initialValue?: number): number[][];
export declare function createVector(elementCount: number, initialValue?: number): number[];
export declare function createVectorForIntegerRange(start: number, end: number): number[];
export declare function zeroIfNaN(val: number): number;
export declare function logSumExp(values: number[], minVal?: number): number;
export declare function sumExp(values: number[]): number;
export declare function logSoftmax(values: number[], minVal?: number): number[];
export declare class IncrementalMean {
    currentElementCount: number;
    currentMean: number;
    addValueToMean(value: number): void;
}
export type DistanceFunction = (a: number[], b: number[]) => number;
export interface ComplexNumber {
    real: number;
    imaginary: number;
}
