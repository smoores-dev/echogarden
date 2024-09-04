export declare function encodeSignedInt32(value: number, outEncodedData: number[]): number[];
export declare function encodeSignedInt32sFast(value: number, outEncodedData: number[]): void;
export declare function decodeSignedInt32s(encodedData: ArrayLike<number>, outDecodedValues: number[]): number[];
export declare function decodeSignedInt32sFast(encodedData: ArrayLike<number>, outDecodedValues: number[]): number[];
export declare function testLeb128(): void;
