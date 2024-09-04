/// <reference types="node" resolution-mode="require"/>
import { SampleFormat, BitDepth } from '../codecs/WaveCodec.js';
import { Timeline } from '../utilities/Timeline.js';
export declare function encodeRawAudioToWave(rawAudio: RawAudio, bitDepth?: BitDepth, sampleFormat?: SampleFormat, speakerPositionMask?: number): Buffer;
export declare function decodeWaveToRawAudio(waveFileBuffer: Buffer, ignoreTruncatedChunks?: boolean, ignoreOverflowingDataChunks?: boolean): {
    rawAudio: {
        audioChannels: Float32Array[];
        sampleRate: number;
    };
    sourceSampleFormat: SampleFormat;
    sourceBitDepth: BitDepth;
    sourceSpeakerPositionMask: number;
};
export declare function trimAudioStart(audioSamples: Float32Array, targetStartSilentSampleCount?: number, amplitudeThresholdDecibels?: number): Float32Array;
export declare function trimAudioEnd(audioSamples: Float32Array, targetEndSilentSampleCount?: number, amplitudeThresholdDecibels?: number): Float32Array;
export declare function getStartingSilentSampleCount(audioSamples: Float32Array, amplitudeThresholdDecibels?: number): number;
export declare function getEndingSilentSampleCount(audioSamples: Float32Array, amplitudeThresholdDecibels?: number): number;
export declare function downmixToMonoAndNormalize(rawAudio: RawAudio, targetPeakDecibels?: number): RawAudio;
export declare function attenuateIfClipping(rawAudio: RawAudio): RawAudio;
export declare function normalizeAudioLevel(rawAudio: RawAudio, targetPeakDecibels?: number, maxGainIncreaseDecibels?: number): RawAudio;
export declare function correctDCBias(rawAudio: RawAudio): RawAudio;
export declare function applyGainDecibels(rawAudio: RawAudio, gainDecibels: number): RawAudio;
export declare function applyGainFactor(rawAudio: RawAudio, gainFactor: number): RawAudio;
export declare function downmixToMono(rawAudio: RawAudio): RawAudio;
export declare function getSamplePeakDecibels(audioChannels: Float32Array[]): number;
export declare function getSamplePeakAmplitude(audioChannels: Float32Array[]): number;
export declare function mixAudio(rawAudio1: RawAudio, rawAudio2: RawAudio): RawAudio;
export declare function sliceRawAudioByTime(rawAudio: RawAudio, startTime: number, endTime: number): RawAudio;
export declare function sliceRawAudio(rawAudio: RawAudio, startSampleIndex: number, endSampleIndex: number): RawAudio;
export declare function sliceAudioChannels(audioChannels: Float32Array[], startSampleIndex: number, endSampleIndex: number): Float32Array[];
export declare function concatAudioSegments(audioSegments: Float32Array[][]): Float32Array[];
export declare function cropToTimeline(rawAudio: RawAudio, timeline: Timeline): RawAudio;
export declare function fadeAudioInOut(rawAudio: RawAudio, fadeTime: number): RawAudio;
export declare function cloneRawAudio(rawAudio: RawAudio): RawAudio;
export declare function getSilentAudio(sampleCount: number, channelCount: number): Float32Array[];
export declare function getEmptyRawAudio(channelCount: number, sampleRate: number): RawAudio;
export declare function getRawAudioDuration(rawAudio: RawAudio): number;
export declare function ensureRawAudio(input: AudioSourceParam, outSampleRate?: number, outChannelCount?: number): Promise<RawAudio>;
export declare function subtractAudio(audio1: RawAudio, audio2: RawAudio): RawAudio;
export declare function gainFactorToDecibels(gainFactor: number): number;
export declare function decibelsToGainFactor(decibels: number): number;
export declare function powerToDecibels(power: number): number;
export declare function decibelsToPower(decibels: number): number;
export type RawAudio = {
    audioChannels: Float32Array[];
    sampleRate: number;
};
export type AudioEncoding = {
    codec?: string;
    format: string;
    channelCount: number;
    sampleRate: number;
    bitdepth: number;
    sampleFormat: SampleFormat;
    bitrate?: number;
};
export type AudioSourceParam = string | Buffer | Uint8Array | RawAudio;
