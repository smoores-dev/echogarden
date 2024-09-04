import { ensureRawAudio, subtractAudio } from '../audio/AudioUtilities.js';
import { Logger } from '../utilities/Logger.js';
import { extendDeep } from '../utilities/ObjectUtilities.js';
import { loadPackage } from '../utilities/PackageManager.js';
import chalk from 'chalk';
import { readdir } from '../utilities/FileSystem.js';
import path from 'node:path';
export async function isolate(input, options) {
    const logger = new Logger();
    const startTimestamp = logger.getTimestamp();
    logger.start('Prepare for source separation');
    const inputRawAudio = await ensureRawAudio(input);
    let isolatedRawAudio;
    let backgroundRawAudio;
    options = extendDeep(defaultSourceSeparationOptions, options);
    switch (options.engine) {
        case 'mdx-net': {
            const MDXNetSourceSeparation = await import('../source-separation/MDXNetSourceSeparation.js');
            const mdxNetOptions = options.mdxNet;
            const executionProviders = mdxNetOptions.executionProvider ? [mdxNetOptions.executionProvider] : [];
            const packageDir = await loadPackage(`mdxnet-${mdxNetOptions.model}`);
            const modelFilename = (await readdir(packageDir)).filter(name => name.endsWith('onnx'))[0];
            if (!modelFilename) {
                throw new Error(`Couldn't find an ONNX model file in package directory`);
            }
            const modelPath = path.join(packageDir, modelFilename);
            logger.end();
            const audioStereo44100 = await ensureRawAudio(inputRawAudio, 44100, 2);
            isolatedRawAudio = await MDXNetSourceSeparation.isolate(audioStereo44100, modelPath, executionProviders);
            logger.end();
            logger.start(`Subtract from original waveform to extract background audio`);
            backgroundRawAudio = subtractAudio(audioStereo44100, isolatedRawAudio);
            break;
        }
        default: {
            throw new Error(`Engine '${options.engine}' is not supported`);
        }
    }
    logger.end();
    logger.log('');
    logger.logDuration(`Total source separation time`, startTimestamp, chalk.magentaBright);
    return {
        inputRawAudio,
        isolatedRawAudio,
        backgroundRawAudio
    };
}
export const defaultSourceSeparationOptions = {
    engine: 'mdx-net',
    mdxNet: {
        model: 'UVR_MDXNET_1_9703',
        executionProvider: undefined,
    }
};
export const sourceSeparationEngines = [
    {
        id: 'mdx-net',
        name: 'MDX-NET',
        description: 'Deep learning source separation architecture by KUIELAB (Korea University).',
        type: 'local'
    },
];
//# sourceMappingURL=SourceSeparation.js.map