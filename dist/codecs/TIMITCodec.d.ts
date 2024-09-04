/// <reference types="node" resolution-mode="require"/>
export declare function decodeTimitAudioFile(filename: string): Promise<{
    audioChannels: Float32Array[];
    sampleRate: number;
}>;
export declare function decodeTimitAudio(data: Buffer): {
    audioChannels: Float32Array[];
    sampleRate: number;
};
