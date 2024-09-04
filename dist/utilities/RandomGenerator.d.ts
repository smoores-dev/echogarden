export declare abstract class RandomGenerator {
    getIntInRange(min: number, max: number): number;
    getFloatInRange(min?: number, max?: number): number;
    getFloats(length: number, min?: number, max?: number): number[];
    getInts(length: number, min: number, max: number): number[];
    getNormallyDistributedVector(featureCount: number, meanVector: number[], standardDeviationVector: number[]): number[];
    getNormallyDistributedValues(count: number, mean?: number, standardDeviation?: number): number[];
    getNormallyDistributedPair(): number[];
    selectRandomIndexFromDistribution(distribution: number[]): number;
    abstract nextFloat(): number;
    abstract nextUint32(): number;
    abstract nextInt32(): number;
}
export declare class MurmurRNG extends RandomGenerator {
    state: number;
    constructor(seed: number);
    nextFloat(): number;
    nextUint32(): number;
    nextInt32(): number;
    static hashInt32(val: number, seed?: number): number;
}
export declare class XorShift32RNG extends RandomGenerator {
    state: number;
    constructor(seed: number);
    nextFloat(): number;
    nextUint32(): number;
    nextInt32(): number;
}
export declare class LehmerRNG extends RandomGenerator {
    state: number;
    constructor(seed: number);
    nextFloat(): number;
    nextUint32(): number;
    nextInt32(): number;
}
export declare function testRngCycleLength(): void;
