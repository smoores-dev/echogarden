/// <reference types="node" resolution-mode="require"/>
import { BitDepth, SampleFormat } from '../codecs/WaveCodec.js';
export declare function encodeToAudioBuffer(audioChannels: Float32Array[], targetBitDepth?: BitDepth, targetSampleFormat?: SampleFormat): Buffer;
export declare function decodeToChannels(audioBuffer: Buffer, channelCount: number, sourceBitDepth: number, sourceSampleFormat: SampleFormat): Float32Array[];
export declare function int8PcmToFloat32(input: Int8Array): Float32Array;
export declare function float32ToInt8Pcm(input: Float32Array): Int8Array;
export declare function int16PcmToFloat32(input: Int16Array): Float32Array;
export declare function float32ToInt16Pcm(input: Float32Array): Int16Array;
export declare function int24PcmToFloat32(input: Int32Array): Float32Array;
export declare function float32ToInt24Pcm(input: Float32Array): Int32Array;
export declare function int32PcmToFloat32(input: Int32Array): Float32Array;
export declare function float32ToInt32Pcm(input: Float32Array): Int32Array;
export declare function interleaveChannels(channels: Float32Array[]): Float32Array;
export declare function deInterleaveChannels(interleavedChannels: Float32Array, channelCount: number): Float32Array[];
export declare function clampFloatSample(floatSample: number): number;
