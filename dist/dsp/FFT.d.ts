import { RawAudio } from '../audio/AudioUtilities.js';
import { ComplexNumber } from '../math/VectorMath.js';
export declare function stftr(samples: Float32Array, fftOrder: number, windowSize: number, hopSize: number, windowType: WindowType): Promise<Float32Array[]>;
export declare function stiftr(binsForFrames: Float32Array[], fftOrder: number, windowSize: number, hopSize: number, windowType: WindowType, expectedOutputLength?: number): Promise<Float32Array>;
export declare function getBinFrequencies(binCount: number, maxFrequency: number): Float32Array;
export declare function fftFramesToPowerSpectogram(fftFrames: Float32Array[]): Float32Array[];
export declare function fftFrameToPowerSpectrum(fftFrame: Float32Array): Float32Array;
export declare function binBufferToComplex(bins: Float32Array, extendAndMirror?: boolean): ComplexNumber[];
export declare function complexToBinBuffer(complexBins: ComplexNumber[]): Float32Array;
export declare function getKissFFTInstance(): Promise<any>;
export declare function getWindowWeights(windowType: WindowType, windowSize: number): Float32Array;
export declare function testFFT1(rawAudio: RawAudio): Promise<RawAudio>;
export type WindowType = 'hann' | 'hamming' | 'povey';
