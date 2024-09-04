import * as FFMpegTranscoder from '../codecs/FFMpegTranscoder.js';
import { Logger } from '../utilities/Logger.js';
import { extendDeep } from '../utilities/ObjectUtilities.js';
export async function recognize(rawAudio, languageCode, options, task = 'transcribe') {
    const logger = new Logger();
    logger.start('Load OpenAI module');
    options = extendDeep(defaultOpenAICloudSTTOptions, options);
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI(options);
    logger.start('Encode audio to send');
    const ffmpegOptions = FFMpegTranscoder.getDefaultFFMpegOptionsForSpeech('mp3');
    const encodedAudio = await FFMpegTranscoder.encodeFromChannels(rawAudio, ffmpegOptions);
    const audioAsWaveBlob = new FileLikeBlob([encodedAudio], 'audio', Date.now(), { type: 'audio/mpeg' });
    logger.start('Request recognition from OpenAI Cloud API');
    let response;
    if (task == 'transcribe') {
        response = await openai.audio.transcriptions.create({
            file: audioAsWaveBlob,
            model: options.model,
            language: languageCode,
            prompt: options.prompt,
            response_format: 'verbose_json',
            temperature: options.temperature,
            timestamp_granularities: ['word', 'segment']
        });
    }
    else if (task == 'translate') {
        response = await openai.audio.translations.create({
            file: audioAsWaveBlob,
            model: options.model,
            prompt: options.prompt,
            response_format: 'verbose_json',
            temperature: options.temperature,
        });
    }
    else {
        throw new Error(`Invalid task`);
    }
    const transcript = response.text;
    let timeline;
    if (response.words) {
        timeline = response.words.map(entry => ({
            type: 'word',
            text: entry.word,
            startTime: entry.start,
            endTime: entry.end
        }));
    }
    else {
        timeline = response.segments.map(entry => ({
            type: 'segment',
            text: entry.text,
            startTime: entry.start,
            endTime: entry.end
        }));
    }
    logger.end();
    return { transcript, timeline };
}
class FileLikeBlob extends Blob {
    parts;
    name;
    lastModified;
    constructor(parts, name, lastModified, options) {
        super(parts, options);
        this.parts = parts;
        this.name = name;
        this.lastModified = lastModified;
    }
}
export const defaultOpenAICloudSTTOptions = {
    apiKey: undefined,
    organization: undefined,
    baseURL: undefined,
    model: 'whisper-1',
    temperature: 0,
    prompt: undefined,
    timeout: undefined,
    maxRetries: 10,
};
//# sourceMappingURL=OpenAICloudSTT.js.map