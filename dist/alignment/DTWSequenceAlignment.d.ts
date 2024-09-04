import { AlignmentPath } from './SpeechAlignment.js';
export declare function alignDTW<T, U>(sequence1: T[], sequence2: U[], costFunction: (a: T, b: U) => number, deletionEnabled?: boolean): {
    path: AlignmentPath;
    pathCost: number;
};
