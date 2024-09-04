export interface CLIOptions {
    play?: boolean;
    overwrite?: boolean;
    debug?: boolean;
    config?: string;
}
export declare const CLIOptionsKeys: (keyof CLIOptions)[];
