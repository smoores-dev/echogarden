import * as FFMpegTranscoder from '../codecs/FFMpegTranscoder.js';
import * as AudioBufferConversion from '../audio/AudioBufferConversion.js';
import { Logger } from '../utilities/Logger.js';
import { logToStderr } from '../utilities/Utilities.js';
const log = logToStderr;
export async function recognizeFile(filename, modelPath, verbose = true) {
    const rawAudio = await FFMpegTranscoder.decodeToChannels(filename, 16000, 1);
    return recognize(rawAudio, modelPath, verbose);
}
export async function recognize(rawAudio, modelPath, verbose = true) {
    const logger = new Logger();
    logger.start('Initialize vosk recognizer');
    const audioChannels = rawAudio.audioChannels;
    const sampleRate = rawAudio.sampleRate;
    let Vosk = await import('@echogarden/vosk');
    Vosk.setLogLevel(-1);
    const model = await new Vosk.Model(modelPath);
    const recognizer = new Vosk.Recognizer({ model, sampleRate });
    recognizer.setMaxAlternatives(0);
    recognizer.setWords(true);
    recognizer.setPartialWords(true);
    logger.start('Recognize with vosk');
    const recognitionStartTimestamp = logger.getTimestamp();
    const pcmAudio = AudioBufferConversion.encodeToAudioBuffer(audioChannels, 16);
    const trailingSilence = Buffer.alloc(sampleRate * 4);
    const pcmAudioWithTrailingSilence = Buffer.concat([pcmAudio, trailingSilence]);
    const pcmAudioByteCount = pcmAudioWithTrailingSilence.length;
    const maxChunkSize = sampleRate * 2.0;
    let previousResultText = '';
    for (let readOffset = 0; readOffset < pcmAudioByteCount; readOffset += maxChunkSize) {
        const chunkSize = Math.min(maxChunkSize, pcmAudioByteCount - readOffset);
        const chunk = pcmAudioWithTrailingSilence.subarray(readOffset, readOffset + chunkSize);
        const speechEnded = await recognizer.acceptWaveformAsync(chunk);
        if (verbose) {
            const partialResultText = recognizer.partialResult().partial;
            if (partialResultText != previousResultText) {
                //logger.log(partialResultText)
                //logger.log('')
                previousResultText = partialResultText;
            }
        }
    }
    //const speechEnded = await recognizer.acceptWaveformAsync(pcmAudioWithTrailingSilence)
    const result = recognizer.finalResult();
    recognizer.reset();
    recognizer.free();
    model.free();
    const transcript = result.text;
    const events = result.result;
    if (events.length == 0) {
        return { transcript, timeline: [] };
    }
    const timeline = [];
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const eventText = event.word;
        const eventStart = event.start;
        const eventEnd = event.end;
        const eventConfidence = event.conf;
        timeline.push({
            type: 'word',
            text: eventText,
            startTime: eventStart,
            endTime: eventEnd,
            confidence: eventConfidence
        });
    }
    //logger.logDuration(`Recognition with vosk`, recognitionStartTimestamp)
    logger.end();
    return { transcript, timeline };
}
//# sourceMappingURL=VoskSTT.js.map