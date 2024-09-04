export declare function alignMFCC_DTW(mfccFrames1: number[][], mfccFrames2: number[][], windowLength: number, distanceFunctionKind?: 'euclidian' | 'cosine', centerIndexes?: number[]): Promise<import("./SpeechAlignment.js").AlignmentPath>;
export declare function getCostMatrixMemorySizeMB(sequence1Length: number, sequence2Length: number, windowLength: number): number;
