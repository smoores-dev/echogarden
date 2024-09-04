export declare function synthesize(text: string, speakerId: string | null, serverURL?: string): Promise<{
    rawAudio: {
        audioChannels: Float32Array[];
        sampleRate: number;
    };
}>;
