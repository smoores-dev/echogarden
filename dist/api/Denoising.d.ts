import { AudioSourceParam, RawAudio } from '../audio/AudioUtilities.js';
import { EngineMetadata } from './Common.js';
export declare function denoise(input: AudioSourceParam, options: DenoisingOptions): Promise<{
    denoisedAudio: RawAudio;
    inputRawAudio: RawAudio;
}>;
export interface DenoisingResult {
    denoisedAudio: RawAudio;
    inputRawAudio: RawAudio;
}
export type DenoisingMethod = 'rnnoise';
export interface DenoisingOptions {
    method?: DenoisingMethod;
    postProcessing?: {
        normalizeAudio: boolean;
        targetPeak: number;
        maxGainIncrease: number;
        dryMixGain?: number;
    };
}
export declare const defaultDenoisingOptions: DenoisingOptions;
export declare const denoisingEngines: EngineMetadata[];
