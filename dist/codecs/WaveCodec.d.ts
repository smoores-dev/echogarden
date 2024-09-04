/// <reference types="node" resolution-mode="require"/>
import { RawAudio } from '../audio/AudioUtilities.js';
export declare function encodeWave(rawAudio: RawAudio, bitDepth?: BitDepth, sampleFormat?: SampleFormat, speakerPositionMask?: number): Buffer;
export declare function decodeWave(waveData: Buffer, ignoreTruncatedChunks?: boolean, ignoreOverflowingDataChunks?: boolean): {
    rawAudio: {
        audioChannels: Float32Array[];
        sampleRate: number;
    };
    sourceSampleFormat: SampleFormat;
    sourceBitDepth: BitDepth;
    sourceSpeakerPositionMask: number;
};
export declare function repairWave(waveData: Buffer): Buffer;
export declare enum SampleFormat {
    PCM = 1,
    Float = 3,
    Alaw = 6,
    Mulaw = 7
}
export type BitDepth = 8 | 16 | 24 | 32 | 64;
