import { request } from 'gaxios';
import { Phrase, splitToFragments } from '../nlp/Segmentation.js';
import { concatFloat32Arrays, logToStderr } from '../utilities/Utilities.js';
import * as FFMpegTranscoder from '../codecs/FFMpegTranscoder.js';
import { trimAudioEnd } from '../audio/AudioUtilities.js';
import { Logger } from '../utilities/Logger.js';
import { getShortLanguageCode } from '../utilities/Locale.js';
const log = logToStderr;
const maxTextLengthPerRequest = 200;
export async function synthesizeLongText(text, languageCode = 'en', tld = 'us', sentenceEndPause = 0.75, segmentEndPause = 1.0) {
    if (text.length == 0) {
        throw new Error('Text is empty');
    }
    const logger = new Logger();
    logger.start('Prepare and split text');
    const fragments = await splitToFragments(text, maxTextLengthPerRequest, languageCode);
    const audioFragments = [];
    let fragmentsSampleRate = 0;
    const timeline = [];
    for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];
        logger.start(`Request synthesis for text fragment ${i + 1}/${fragments.length} from Google Translate`);
        const fragmentMp3Stream = await synthesizeShortText(fragment.text, languageCode, tld);
        if (fragmentMp3Stream.length == 0) {
            continue;
        }
        const rawAudio = await FFMpegTranscoder.decodeToChannels(fragmentMp3Stream, 24000, 1);
        fragmentsSampleRate = rawAudio.sampleRate;
        let targetEndingSilenceTime;
        if (fragment.lastSegment?.isSentenceFinalizer) {
            targetEndingSilenceTime = 0.75;
        }
        else if (fragment.lastSegment instanceof Phrase) {
            targetEndingSilenceTime = 0.1;
        }
        else {
            targetEndingSilenceTime = 0;
        }
        const trimmedAudio = trimAudioEnd(rawAudio.audioChannels[0], targetEndingSilenceTime * rawAudio.sampleRate);
        audioFragments.push(trimmedAudio);
        const startTime = timeline.length == 0 ? 0 : timeline[timeline.length - 1].endTime;
        const endTime = startTime + (trimmedAudio.length / fragmentsSampleRate);
        timeline.push({
            type: 'segment',
            text: fragment.text,
            startTime,
            endTime
        });
    }
    logger.end();
    const rawAudio = { audioChannels: [concatFloat32Arrays(audioFragments)], sampleRate: fragmentsSampleRate };
    return {
        rawAudio,
        timeline
    };
}
export async function synthesizeShortText(text, languageCode = 'en', tld = 'us') {
    if (text.length > maxTextLengthPerRequest) {
        throw new Error(`Text is ${text.length} characters, which is longer than the maximum of ${maxTextLengthPerRequest}`);
    }
    if (languageCode != 'zh-CN' && languageCode != 'zh-TW') {
        languageCode = getShortLanguageCode(languageCode);
    }
    const bodyFormParameters = [text, languageCode, null, 'null'];
    const requestForm = [[['jQ1olc', JSON.stringify(bodyFormParameters), null, 'generic']]];
    const stringifiedForm = JSON.stringify(requestForm);
    const requestBody = `f.req=${encodeURIComponent(stringifiedForm)}&`;
    const response = await request({
        method: 'POST',
        url: `https://translate.google.${tld}/_/TranslateWebserverUi/data/batchexecute`,
        params: {
            'rpcids': 'jQ1olc'
        },
        headers: {
            'sec-ch-ua': `".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"`,
            'x-same-domain': '1',
            'dnt': '1',
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            'sec-ch-ua-arch': 'x86',
            'sec-ch-ua-full-version': '103.0.5060.114',
            'sec-ch-ua-platform-version': '10.0.0',
            'sec-ch-ua-full-version-list': `".Not/A)Brand";v="99.0.0.0", "Google Chrome";v="103.0.5060.114", "Chromium";v="103.0.5060.114"`,
            'sec-ch-ua-bitness': '64',
            'sec-ch-ua-model': '',
            'sec-ch-ua-platform': 'Windows',
            'accept': '*/*',
            'origin': 'https://translate.google.com',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://translate.google.com/',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
        },
        body: requestBody,
        responseType: 'text'
    });
    //log(response.data)
    const audioChunks = [];
    for (const line of response.data.split(/\r?\n/)) {
        const match = line.match(/"jQ1olc","\[\\"(.*)\\"]/);
        if (match != null) {
            const base64AudioChunk = match[1];
            audioChunks.push(Buffer.from(base64AudioChunk, 'base64'));
        }
    }
    const resultMp3Stream = Buffer.concat(audioChunks);
    return resultMp3Stream;
}
export const supportedLanguageLookup = {
    'af': 'Afrikaans',
    'ar': 'Arabic',
    'bg': 'Bulgarian',
    'bn': 'Bengali',
    'bs': 'Bosnian',
    'ca': 'Catalan',
    'cs': 'Czech',
    'cy': 'Welsh',
    'da': 'Danish',
    'de': 'German',
    'el': 'Greek',
    'en': 'English',
    'eo': 'Esperanto',
    'es': 'Spanish',
    'et': 'Estonian',
    'fi': 'Finnish',
    'fr': 'French',
    'gu': 'Gujarati',
    'hi': 'Hindi',
    'hr': 'Croatian',
    'hu': 'Hungarian',
    'hy': 'Armenian',
    'id': 'Indonesian',
    'is': 'Icelandic',
    'it': 'Italian',
    'iw': 'Hebrew',
    'ja': 'Japanese',
    'jw': 'Javanese',
    'km': 'Khmer',
    'kn': 'Kannada',
    'ko': 'Korean',
    'la': 'Latin',
    'lv': 'Latvian',
    'mk': 'Macedonian',
    'ms': 'Malay',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'my': 'Myanmar (Burmese)',
    'ne': 'Nepali',
    'nl': 'Dutch',
    'no': 'Norwegian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ro': 'Romanian',
    'ru': 'Russian',
    'si': 'Sinhala',
    'sk': 'Slovak',
    'sq': 'Albanian',
    'sr': 'Serbian',
    'su': 'Sundanese',
    'sv': 'Swedish',
    'sw': 'Swahili',
    'ta': 'Tamil',
    'te': 'Telugu',
    'th': 'Thai',
    'tl': 'Filipino',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'vi': 'Vietnamese',
    'zh-CN': 'Chinese',
    'zh-TW': 'Chinese (Mandarin/Taiwan)',
    'zh': 'Chinese (Mandarin)',
};
//# sourceMappingURL=GoogleTranslateTTS.js.map