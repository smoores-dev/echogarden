import { request } from 'gaxios';
import { decodeWaveToRawAudio } from '../audio/AudioUtilities.js';
import { Logger } from '../utilities/Logger.js';
import { logToStderr } from '../utilities/Utilities.js';
const log = logToStderr;
export async function synthesize(text, speakerId, serverURL = 'http://[::1]:5002') {
    const logger = new Logger();
    logger.start('Request synthesis from Coqui Server');
    const response = await request({
        url: `${serverURL}/api/tts`,
        params: {
            'text': text,
            'speaker_id': speakerId
        },
        responseType: 'arraybuffer'
    });
    const waveData = Buffer.from(response.data);
    const { rawAudio } = decodeWaveToRawAudio(waveData);
    logger.end();
    return { rawAudio };
}
//# sourceMappingURL=CoquiServerTTS.js.map