import { concatFloat32Arrays, logToStderr, objToString, simplifyPunctuationCharacters } from '../utilities/Utilities.js';
import { int16PcmToFloat32 } from '../audio/AudioBufferConversion.js';
import { Logger } from '../utilities/Logger.js';
import { WasmMemoryManager } from '../utilities/WasmMemoryManager.js';
import { getEmptyRawAudio } from '../audio/AudioUtilities.js';
import { playAudioWithTimelinePhones } from '../audio/AudioPlayer.js';
import { getNormalizedFragmentsForSpeech } from '../nlp/TextNormalizer.js';
import { ipaPhoneToKirshenbaum } from '../nlp/PhoneConversion.js';
import { splitToWords, wordCharacterPattern } from '../nlp/Segmentation.js';
import { tryGetFirstLexiconSubstitution } from '../nlp/Lexicon.js';
import { phonemizeSentence } from '../nlp/EspeakPhonemizer.js';
import { extendDeep } from '../utilities/ObjectUtilities.js';
const log = logToStderr;
let espeakInstance;
let espeakModule;
export async function preprocessAndSynthesize(text, language, espeakOptions, lexicons = []) {
    const logger = new Logger();
    espeakOptions = extendDeep(defaultEspeakOptions, espeakOptions);
    await logger.startAsync('Tokenize and analyze text');
    let lowerCaseLanguageCode = language.toLowerCase();
    if (lowerCaseLanguageCode === 'en-gb') {
        lowerCaseLanguageCode = 'en-gb-x-rp';
    }
    let fragments;
    let preprocessedFragments;
    const phonemizedFragmentsSubstitutions = new Map();
    fragments = [];
    preprocessedFragments = [];
    let words = await splitToWords(text, language);
    // Merge repeating symbol words to a single word to work around eSpeak bug
    const wordsWithMerges = [];
    for (let i = 0; i < words.length; i++) {
        const currentWord = words[i];
        const previousWord = words[i - 1];
        if (i > 0 && currentWord === previousWord && !wordCharacterPattern.test(currentWord)) {
            wordsWithMerges[wordsWithMerges.length - 1] += currentWord;
        }
        else {
            wordsWithMerges.push(currentWord);
        }
    }
    words = wordsWithMerges;
    // Remove words containing only whitespace
    words = words.filter(word => word.trim() != '');
    const { normalizedFragments, referenceFragments } = getNormalizedFragmentsForSpeech(words, language);
    const simplifiedFragments = normalizedFragments.map(word => simplifyPunctuationCharacters(word).toLocaleLowerCase());
    if ([`'`].includes(simplifiedFragments[0])) {
        normalizedFragments[0] = `()`;
    }
    for (let fragmentIndex = 0; fragmentIndex < normalizedFragments.length; fragmentIndex++) {
        const fragment = normalizedFragments[fragmentIndex];
        const substitutionPhonemes = tryGetFirstLexiconSubstitution(simplifiedFragments, fragmentIndex, lexicons, lowerCaseLanguageCode);
        if (!substitutionPhonemes) {
            continue;
        }
        phonemizedFragmentsSubstitutions.set(fragmentIndex, substitutionPhonemes);
        const referenceIPA = (await textToPhonemes(fragment, espeakOptions.voice, true)).replaceAll('_', ' ');
        const referenceKirshenbaum = (await textToPhonemes(fragment, espeakOptions.voice, false)).replaceAll('_', '');
        const kirshenbaumPhonemes = substitutionPhonemes.map(phone => ipaPhoneToKirshenbaum(phone)).join('');
        logger.logTitledMessage(`\nLexicon substitution for '${fragment}'`, `IPA: ${substitutionPhonemes.join(' ')} (original: ${referenceIPA}), Kirshenbaum: ${kirshenbaumPhonemes} (reference: ${referenceKirshenbaum})`);
        const substitutionPhonemesFragment = ` [[${kirshenbaumPhonemes}]] `;
        normalizedFragments[fragmentIndex] = substitutionPhonemesFragment;
    }
    fragments = referenceFragments;
    preprocessedFragments = normalizedFragments;
    logger.start('Synthesize preprocessed fragments with eSpeak');
    const { rawAudio: referenceSynthesizedAudio, timeline: referenceTimeline } = await synthesizeFragments(preprocessedFragments, espeakOptions);
    await logger.startAsync('Build phonemized tokens');
    const phonemizedSentence = [];
    let wordIndex = 0;
    for (const phraseEntry of referenceTimeline) {
        const phrase = [];
        for (const wordEntry of phraseEntry.timeline) {
            wordEntry.text = fragments[wordIndex];
            if (phonemizedFragmentsSubstitutions.has(wordIndex)) {
                phrase.push(phonemizedFragmentsSubstitutions.get(wordIndex));
            }
            else {
                for (const tokenEntry of wordEntry.timeline) {
                    const tokenPhonemes = [];
                    for (const phoneme of tokenEntry.timeline) {
                        if (phoneme.text) {
                            tokenPhonemes.push(phoneme.text);
                        }
                    }
                    if (tokenPhonemes.length > 0) {
                        phrase.push(tokenPhonemes);
                    }
                }
            }
            wordIndex += 1;
        }
        if (phrase.length > 0) {
            phonemizedSentence.push(phrase);
        }
    }
    logger.log(phonemizedSentence.map(phrase => phrase.map(word => word.join(' ')).join(' | ')).join(' || '));
    logger.end();
    return { referenceSynthesizedAudio, referenceTimeline, fragments, preprocessedFragments, phonemizedFragmentsSubstitutions, phonemizedSentence };
}
export async function synthesizeFragments(fragments, espeakOptions) {
    espeakOptions = extendDeep(defaultEspeakOptions, espeakOptions);
    const voice = espeakOptions.voice;
    const sampleRate = await getSampleRate();
    if (fragments.length === 0) {
        return {
            rawAudio: getEmptyRawAudio(1, sampleRate),
            timeline: [],
            events: []
        };
    }
    const canInsertSeparators = !['roa/an', 'art/eo', 'trk/ky', 'zlw/pl', 'zle/uk'].includes(voice);
    let textWithMarkers;
    if (canInsertSeparators) {
        textWithMarkers = `() | `;
    }
    else {
        textWithMarkers = `() `;
    }
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        fragment = simplifyPunctuationCharacters(fragment);
        fragment = fragment
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
        if (espeakOptions.insertSeparators && canInsertSeparators) {
            const separator = ` | `;
            textWithMarkers += `<mark name="s-${i}"/>${separator}${fragment}${separator}<mark name="e-${i}"/>`;
        }
        else {
            if (fragment.endsWith('.')) {
                fragment += ' ()';
            }
            textWithMarkers += `<mark name="s-${i}"/>${fragment}<mark name="e-${i}"/> `;
        }
    }
    const { rawAudio, events } = await synthesize(textWithMarkers, { ...espeakOptions, ssml: true });
    // Add first marker if missing
    if (fragments.length > 0) {
        const firstMarkerEvent = events.find(event => event.type === 'mark');
        if (firstMarkerEvent && firstMarkerEvent.id === 'e-0') {
            events.unshift({
                type: 'mark',
                text_position: 0,
                word_length: 0,
                audio_position: 0,
                id: 's-0',
            });
        }
    }
    // Build word timeline from events
    const wordTimeline = fragments.map(word => ({
        type: 'word',
        text: word,
        startTime: -1,
        endTime: -1,
        timeline: [{
                type: 'token',
                text: '',
                startTime: -1,
                endTime: -1,
                timeline: []
            }]
    }));
    let wordIndex = 0;
    const clauseEndIndexes = [];
    for (const event of events) {
        const eventTime = event.audio_position / 1000;
        const currentWordEntry = wordTimeline[wordIndex];
        const currentTokenTimeline = currentWordEntry.timeline;
        const currentTokenEntry = currentTokenTimeline[currentTokenTimeline.length - 1];
        const currentPhoneTimeline = currentTokenEntry.timeline;
        const lastPhoneEntry = currentPhoneTimeline[currentPhoneTimeline.length - 1];
        if (lastPhoneEntry && lastPhoneEntry.endTime === -1) {
            lastPhoneEntry.endTime = eventTime;
        }
        if (event.type === 'word') {
            if (!event.id || currentPhoneTimeline.length === 0) {
                continue;
            }
            if (currentTokenEntry.endTime === -1) {
                currentTokenEntry.endTime = eventTime;
            }
            currentTokenTimeline.push({
                type: 'token',
                text: '',
                startTime: eventTime,
                endTime: -1,
                timeline: []
            });
        }
        else if (event.type === 'phoneme') {
            const phoneText = event.id;
            if (!phoneText || phoneText.startsWith('(')) {
                continue;
            }
            currentPhoneTimeline.push({
                type: 'phone',
                text: phoneText,
                startTime: eventTime,
                endTime: -1
            });
            currentTokenEntry.text += phoneText;
            currentTokenEntry.startTime = currentPhoneTimeline[0].startTime;
        }
        else if (event.type === 'mark') {
            const markerName = event.id;
            if (markerName.startsWith('s-')) {
                const markerIndex = parseInt(markerName.substring(2));
                if (markerIndex != wordIndex) {
                    throw new Error(`Word start marker for index ${wordIndex} is not consistent with word index. The words were: ${objToString(fragments)}`);
                }
                if (currentPhoneTimeline.length > 0) {
                    throw new Error(`Word entry ${wordIndex} already has phones before its start marker was seen. The words were: ${objToString(fragments)}`);
                }
                currentWordEntry.startTime = eventTime;
                currentTokenEntry.startTime = eventTime;
            }
            else if (markerName.startsWith('e-')) {
                const markerIndex = parseInt(markerName.substring(2));
                if (markerIndex != wordIndex) {
                    throw new Error(`Word end marker for index ${wordIndex} is not consistent with word index. The words were: ${objToString(fragments)}`);
                }
                currentWordEntry.startTime = currentTokenTimeline[0].startTime;
                currentWordEntry.endTime = eventTime;
                currentTokenEntry.endTime = eventTime;
                wordIndex += 1;
                if (wordIndex === wordTimeline.length) {
                    break;
                }
            }
            else {
                continue;
            }
        }
        else if (event.type === 'end') {
            clauseEndIndexes.push(wordIndex);
        }
    }
    clauseEndIndexes.push(wordTimeline.length);
    // Split compound tokens
    for (const [index, wordEntry] of wordTimeline.entries()) {
        const tokenTimeline = wordEntry.timeline;
        if (index === 0) {
            continue;
        }
        if (!tokenTimeline || tokenTimeline.length === 0) {
            throw new Error('Unexpected: token timeline should exist and have at least one token');
        }
        if (tokenTimeline.length !== 1 && tokenTimeline[0].text != '') {
            continue;
        }
        const wordReferencePhonemes = (await textToPhonemes(wordEntry.text, espeakOptions.voice, true)).split('_');
        const wordReferenceIPA = wordReferencePhonemes.join(' ');
        if (wordReferenceIPA.trim().length === 0) {
            continue;
        }
        const wordReferenceIPAWithoutStress = wordReferenceIPA.replaceAll('ˈ', '').replaceAll('ˌ', '');
        const previousWordEntry = wordTimeline[index - 1];
        if (!previousWordEntry.timeline) {
            continue;
        }
        const previousWordTokenEntry = previousWordEntry.timeline[previousWordEntry.timeline.length - 1];
        if (!previousWordTokenEntry.timeline) {
            continue;
        }
        const previousWordTokenIPAWithoutStress = previousWordTokenEntry.timeline.map(phoneEntry => phoneEntry.text.replaceAll('ˈ', '').replaceAll('ˌ', '')).join(' ');
        if (previousWordEntry.timeline.length > 1 && previousWordTokenIPAWithoutStress === wordReferenceIPAWithoutStress) {
            tokenTimeline.pop();
            const tokenEntryToInsert = previousWordEntry.timeline.pop();
            tokenTimeline.push(tokenEntryToInsert);
            previousWordEntry.endTime = previousWordEntry.timeline[previousWordEntry.timeline.length - 1].endTime;
            wordEntry.startTime = tokenEntryToInsert.startTime;
            wordEntry.endTime = tokenEntryToInsert.endTime;
            continue;
        }
        if (previousWordTokenEntry.timeline.length <= wordReferencePhonemes.length) {
            continue;
        }
        if (!previousWordTokenIPAWithoutStress.endsWith(wordReferenceIPAWithoutStress)) {
            continue;
        }
        const tokenEntry = tokenTimeline[0];
        tokenEntry.timeline = previousWordTokenEntry.timeline.splice(previousWordTokenEntry.timeline.length - wordReferencePhonemes.length);
        tokenEntry.text = tokenEntry.timeline.map(phoneEntry => phoneEntry.text).join('');
        tokenEntry.startTime = tokenEntry.timeline[0].startTime;
        tokenEntry.endTime = tokenEntry.timeline[tokenEntry.timeline.length - 1].endTime;
        wordEntry.startTime = tokenEntry.startTime;
        wordEntry.endTime = tokenEntry.endTime;
        previousWordTokenEntry.text = previousWordTokenEntry.timeline.map(phoneEntry => phoneEntry.text).join('');
        previousWordTokenEntry.endTime = previousWordTokenEntry.timeline[previousWordTokenEntry.timeline.length - 1].endTime;
        previousWordEntry.endTime = previousWordTokenEntry.endTime;
    }
    // Build clause timeline
    const clauseTimeline = [];
    let clauseStartIndex = 0;
    for (const clauseEndIndex of clauseEndIndexes) {
        const newClause = {
            type: 'clause',
            text: '',
            startTime: -1,
            endTime: -1,
            timeline: []
        };
        for (let entryIndex = clauseStartIndex; entryIndex <= clauseEndIndex && entryIndex < wordTimeline.length; entryIndex++) {
            const wordEntry = wordTimeline[entryIndex];
            if (newClause.startTime === -1) {
                newClause.startTime = wordEntry.startTime;
            }
            newClause.endTime = wordEntry.endTime;
            newClause.text += `${wordEntry.text} `;
            newClause.timeline.push(wordEntry);
        }
        if (newClause.timeline.length > 0) {
            clauseTimeline.push(newClause);
            clauseStartIndex = clauseEndIndex + 1;
        }
    }
    return { rawAudio, timeline: clauseTimeline, events };
}
export async function synthesize(text, espeakOptions) {
    const logger = new Logger();
    espeakOptions = extendDeep(defaultEspeakOptions, espeakOptions);
    logger.start('Get eSpeak Emscripten instance');
    if (!espeakOptions.ssml) {
        const { escape } = await import('html-escaper');
        text = escape(text);
    }
    const { instance } = await getEspeakInstance();
    const sampleChunks = [];
    const allEvents = [];
    logger.start('Synthesize with eSpeak');
    if (espeakOptions.useKlatt) {
        await setVoice(`${espeakOptions.voice}+klatt6`);
    }
    else {
        await setVoice(espeakOptions.voice);
    }
    await setRate(espeakOptions.rate);
    await setPitch(espeakOptions.pitch);
    await setPitchRange(espeakOptions.pitchRange);
    instance.synthesize(text, (samples, events) => {
        if (samples && samples.length > 0) {
            sampleChunks.push(int16PcmToFloat32(samples));
        }
        for (const event of events) {
            if (event.type === 'word') {
                const textPosition = event.text_position - 1;
                event['text'] = text.substring(textPosition, textPosition + event.word_length);
            }
        }
        allEvents.push(...events);
    });
    const concatenatedSamples = concatFloat32Arrays(sampleChunks);
    const rawAudio = { audioChannels: [concatenatedSamples], sampleRate: 22050 };
    logger.end();
    return { rawAudio, events: allEvents };
}
export async function textToIPA(text, voice) {
    await setVoice(voice);
    const { instance } = await getEspeakInstance();
    const ipa = instance.synthesize_ipa(text).ipa.trim();
    return ipa;
}
export async function textToPhonemes(text, voice, useIPA = true) {
    await setVoice(voice);
    const { instance, module } = await getEspeakInstance();
    const textPtr = instance.convert_to_phonemes(text, useIPA);
    const wasmMemory = new WasmMemoryManager(module);
    const resultRef = wasmMemory.wrapNullTerminatedUtf8String(textPtr.ptr);
    const result = resultRef.getValue();
    wasmMemory.freeAll();
    return result;
}
export async function setVoice(voiceId) {
    const { instance } = await getEspeakInstance();
    instance.set_voice(voiceId);
}
export async function setVolume(volume) {
    const { instance } = await getEspeakInstance();
    return instance.setVolume(volume);
}
export async function setRate(rate) {
    const { instance } = await getEspeakInstance();
    return instance.set_rate(rate);
}
export async function setPitch(pitch) {
    const { instance } = await getEspeakInstance();
    return instance.set_pitch(pitch);
}
export async function setPitchRange(pitchRange) {
    const { instance } = await getEspeakInstance();
    return instance.set_range(pitchRange);
}
export async function getSampleRate() {
    return 22050;
}
export async function listVoices() {
    const { instance } = await getEspeakInstance();
    const voiceList = instance.list_voices();
    return voiceList;
}
async function getEspeakInstance() {
    if (!espeakInstance) {
        const { default: EspeakInitializer } = await import('@echogarden/espeak-ng-emscripten');
        const m = await EspeakInitializer();
        espeakInstance = await (new m.eSpeakNGWorker());
        espeakModule = m;
    }
    return { instance: espeakInstance, module: espeakModule };
}
export const defaultEspeakOptions = {
    voice: 'en-us',
    ssml: false,
    rate: 1.0,
    pitch: 1.0,
    pitchRange: 1.0,
    useKlatt: false,
    insertSeparators: false
};
export async function testEspeakSynthesisWithPrePhonemizedInputs(text) {
    const ipaPhonemizedSentence = (await phonemizeSentence(text, 'en-us')).flatMap(clause => clause);
    const kirshenbaumPhonemizedSentence = (await phonemizeSentence(text, 'en-us', undefined, false)).flatMap(clause => clause);
    log(kirshenbaumPhonemizedSentence);
    const fragments = ipaPhonemizedSentence.map(word => word.map(phoneme => ipaPhoneToKirshenbaum(phoneme)).join('')).map(word => ` [[${word}]] `);
    const { rawAudio, timeline } = await synthesizeFragments(fragments, defaultEspeakOptions);
    await playAudioWithTimelinePhones(rawAudio, timeline);
}
export async function testKirshenbaumPhonemization(text) {
    const ipaPhonemizedSentence = (await phonemizeSentence(text, 'en-us')).flatMap(clause => clause);
    const kirshenbaumPhonemizedSentence = (await phonemizeSentence(text, 'en-us', undefined, false)).flatMap(clause => clause);
    const ipaFragments = ipaPhonemizedSentence.map(word => word.join(''));
    const kirshenbaumFragments = kirshenbaumPhonemizedSentence.map(word => word.join(''));
    const fragments = ipaPhonemizedSentence.map(word => word.map(phoneme => ipaPhoneToKirshenbaum(phoneme)).join(''));
    for (let i = 0; i < fragments.length; i++) {
        log(`IPA: ${ipaFragments[i]} | converted: ${fragments[i]} | ground truth: ${kirshenbaumFragments[i]}`);
    }
}
//# sourceMappingURL=EspeakTTS.js.map