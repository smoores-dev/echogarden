/// <reference types="node" resolution-mode="require"/>
export declare function knuthMultiplicative(bytes: Buffer): number;
export declare function xorShift32Hash(bytes: Buffer): number;
export declare function jenkinsOneAtATime(bytes: Buffer): number;
export declare function FNV1a(bytes: Buffer): number;
export declare function superFastHash(bytes: Buffer): number;
export declare function cyrb53Hash(bytes: Buffer, seed?: number): number;
export declare function djb2(bytes: Buffer): number;
export declare function murmurHash1(bytes: Buffer, seed?: number): number;
export declare function MurmurHash3(bytes: Buffer, seed?: number): number;
