import { RawAudio } from '../audio/AudioUtilities.js';
export declare function computeMFCCs(monoAudio: RawAudio, options?: MfccOptions): Promise<number[][]>;
export declare function melSpectogramToMFCCs(melSpectogram: Float32Array[], mfccFeatureCount: number): Float32Array[];
export declare function melSpectrumToMFCC(melSpectrum: Float32Array, mfccFeatureCount: number, dctMatrix: Float32Array[], normalization?: 'none' | 'orthonormal'): Float32Array;
export declare function createDCTType2CoefficientMatrix(mfccFeatureCount: number, melBandCount: number): Float32Array[];
export declare function mfccBufferToVectors(mfccBuffer: Float64Array, mfccFeatureCount: number): number[][];
export declare function applyEmphasis(samples: Float32Array, emphasisFactor?: number, initialState?: number): Float32Array;
export declare function applyLiftering(mfccs: number[][], lifteringFactor: number): number[][];
export type MfccOptions = {
    filterbankCount?: number;
    featureCount?: number;
    fftOrder?: number;
    lowerFreq?: number;
    upperFreq?: number;
    windowDuration?: number;
    hopDuration?: number;
    emphasisFactor?: number;
    analysisSampleRate?: number;
    lifteringFactor?: number;
    normalize?: boolean;
    zeroFirstCoefficient?: boolean;
};
export declare const defaultMfccOptions: MfccOptions;
export declare function extendDefaultMfccOptions(options: MfccOptions): any;
