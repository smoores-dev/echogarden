import { AlignmentPath } from './SpeechAlignment.js';
export declare function alignDTWWindowed<T, U>(sequence1: T[], sequence2: U[], costFunction: (a: T, b: U) => number, windowMaxLength: number, centerIndexes?: number[]): {
    path: AlignmentPath;
    pathCost: number;
};
