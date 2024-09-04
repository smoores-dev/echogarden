/// <reference path="../../src/typings/Fillers.d.ts" />
import type * as Onnx from 'onnxruntime-node';
import { RawAudio } from '../audio/AudioUtilities.js';
import { OnnxExecutionProvider } from '../utilities/OnnxUtilities.js';
export declare function isolate(rawAudio: RawAudio, modelFilePath: string, executionProviders: OnnxExecutionProvider[]): Promise<RawAudio>;
export declare class MDXNet {
    readonly modelFilePath: string;
    readonly executionProviders: OnnxExecutionProvider[];
    session?: Onnx.InferenceSession;
    constructor(modelFilePath: string, executionProviders: OnnxExecutionProvider[]);
    processAudio(rawAudio: RawAudio): Promise<RawAudio>;
    private initializeSessionIfNeeded;
}
