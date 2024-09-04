export declare function makeTarballsForInstalledPackages(skipIfExists?: boolean): Promise<void>;
export declare function createNamedTarball(inputPath: string, name: string): Promise<void>;
export declare function createTarballForEachDirIn(baseDir: string, namePrefix: String): Promise<void>;
export declare function createTarballForEachFileIn(baseDir: string, namePrefix: String): Promise<void>;
