/// <reference types="node" resolution-mode="require"/>
import { Timeline } from '../utilities/Timeline.js';
export declare function synthesizeLongText(text: string, languageCode?: string, tld?: string, sentenceEndPause?: number, segmentEndPause?: number): Promise<{
    rawAudio: {
        audioChannels: Float32Array[];
        sampleRate: number;
    };
    timeline: Timeline;
}>;
export declare function synthesizeShortText(text: string, languageCode?: string, tld?: string): Promise<Buffer>;
export declare const supportedLanguageLookup: {
    [langCode: string]: string;
};
