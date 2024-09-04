import * as CldrSegmentation from 'cldr-segmentation';
import { splitChineseTextToWords_Jieba } from './ChineseSegmentation.js';
import { sumArray, includesAnyOf, indexOfAnyOf, logToStderr } from '../utilities/Utilities.js';
import { getShortLanguageCode } from '../utilities/Locale.js';
import { splitJapaneseTextToWords_Kuromoji } from './JapaneseSegmentation.js';
const log = logToStderr;
export const wordCharacterPattern = /[\p{Letter}\p{Number}]/u;
export const punctuationPattern = /[\p{Punctuation}]/u;
export const phraseSeparators = [',', ';', ':'];
export const sentenceSeparators = ['.', '?', '!'];
export const symbolWords = ['$', '€', '¢', '£', '¥', '©', '®', '™', '%', '&', '#', '~', '@', '+', '±', '÷', '/', '*', '=', '¼', '½', '¾'];
export function isWordOrSymbolWord(str) {
    return isWord(str) || symbolWords.includes(str);
}
export function isSymbolWord(str) {
    return symbolWords.includes(str.trim());
}
export function isWord(str) {
    return wordCharacterPattern.test(str.trim());
}
export function isPunctuation(str) {
    return punctuationPattern.test(str.trim());
}
export function isWhitespace(str) {
    return str.trim().length === 0;
}
export class Sentence {
    phrases = [];
    isSentenceFinalizer = true;
    get length() { return sumArray(this.phrases, (phrase) => phrase.length); }
    get text() { return this.phrases.reduce((result, phrase) => result + phrase.text, ''); }
}
export class Phrase {
    words = [];
    get length() { return sumArray(this.words, (word) => word.length); }
    get text() { return this.words.reduce((result, word) => result + word.text, ''); }
    get lastWord() {
        if (this.words.length == 0) {
            return undefined;
        }
        return this.words[this.words.length - 1];
    }
    get isSentenceFinalizer() { return this.lastWord != null ? this.lastWord.isSentenceFinalizer : false; }
}
export class Word {
    text;
    isSentenceFinalizer;
    constructor(text, isSentenceFinalizer) {
        this.text = text;
        this.isSentenceFinalizer = isSentenceFinalizer;
    }
    get containsOnlyPunctuation() { return !wordCharacterPattern.test(this.text) && !this.isSymbolWord; }
    get isSymbolWord() { return symbolWords.includes(this.text); }
    get isPhraseSeperator() { return this.containsOnlyPunctuation && includesAnyOf(this.text, phraseSeparators); }
    get length() { return this.text.length; }
}
export class Fragment {
    segments = [];
    get length() { return sumArray(this.segments, (phrase) => phrase.length); }
    get text() { return this.segments.reduce((result, segment) => result + segment.text, ''); }
    get isEmpty() { return this.length == 0; }
    get isNonempty() { return !this.isEmpty; }
    get lastSegment() {
        if (this.isEmpty) {
            return undefined;
        }
        return this.segments[this.segments.length - 1];
    }
}
export async function splitToFragments(text, maxFragmentLength, langCode, preserveSentences = true, preservePhrases = true) {
    const parsedText = await parse(text, langCode);
    const fragments = [];
    let currentFragment = new Fragment();
    const remainingCharactersInCurrentFragment = () => maxFragmentLength - currentFragment.length;
    const createNewFragmentIfNeeded = () => {
        if (currentFragment.isNonempty) {
            fragments.push(currentFragment);
            currentFragment = new Fragment();
        }
    };
    const fitsCurrentFragment = (segment) => segment.length <= remainingCharactersInCurrentFragment();
    for (const sentence of parsedText) {
        if (fitsCurrentFragment(sentence)) {
            currentFragment.segments.push(sentence);
            continue;
        }
        if (preserveSentences) {
            createNewFragmentIfNeeded();
            if (fitsCurrentFragment(sentence)) {
                currentFragment.segments.push(sentence);
                continue;
            }
        }
        for (const phrase of sentence.phrases) {
            if (fitsCurrentFragment(phrase)) {
                currentFragment.segments.push(phrase);
                continue;
            }
            if (preservePhrases) {
                createNewFragmentIfNeeded();
                if (fitsCurrentFragment(phrase)) {
                    currentFragment.segments.push(phrase);
                    continue;
                }
            }
            for (const word of phrase.words) {
                if (fitsCurrentFragment(word)) {
                    currentFragment.segments.push(word);
                    continue;
                }
                createNewFragmentIfNeeded();
                if (fitsCurrentFragment(word)) {
                    currentFragment.segments.push(word);
                    continue;
                }
                throw new Error(`Encountered a word of length ${word.length}, which excceeds the maximum fragment length of ${maxFragmentLength}`);
            }
        }
    }
    createNewFragmentIfNeeded();
    return fragments;
}
export async function parse(text, langCode) {
    const sentencesText = splitToSentences(text, langCode);
    const sentences = [];
    for (const sentenceText of sentencesText) {
        const sentence = new Sentence();
        let currentPhrase = new Phrase();
        const wordTexts = await splitToWords(sentenceText, langCode);
        for (let wordIndex = 0; wordIndex < wordTexts.length; wordIndex++) {
            const word = new Word(wordTexts[wordIndex], wordIndex == wordTexts.length - 1);
            if (word.isPhraseSeperator) {
                const separatorIndex = indexOfAnyOf(word.text, phraseSeparators);
                currentPhrase.words.push(new Word(word.text.substring(0, separatorIndex + 1), word.isSentenceFinalizer));
                sentence.phrases.push(currentPhrase);
                currentPhrase = new Phrase();
                currentPhrase.words.push(new Word(word.text.substring(separatorIndex + 1), false));
            }
            else {
                currentPhrase.words.push(word);
            }
        }
        if (currentPhrase.words.length > 0) {
            sentence.phrases.push(currentPhrase);
        }
        sentences.push(sentence);
    }
    return sentences;
}
export function splitToSentences(text, langCode) {
    const shortLangCode = getShortLanguageCode(langCode || '');
    return CldrSegmentation.sentenceSplit(text, CldrSegmentation.suppressions[shortLangCode]);
}
export async function splitToWords(text, langCode) {
    const shortLangCode = getShortLanguageCode(langCode || '');
    if (shortLangCode == 'zh' || shortLangCode == 'cmn') {
        return splitChineseTextToWords_Jieba(text, undefined, true);
    }
    else if (shortLangCode == 'ja') {
        return splitJapaneseTextToWords_Kuromoji(text);
    }
    else {
        return CldrSegmentation.wordSplit(text, CldrSegmentation.suppressions[shortLangCode]);
    }
}
export function splitToParagraphs(text, paragraphBreaks, whitespace) {
    let paragraphs = [];
    if (paragraphBreaks == 'single') {
        paragraphs = text.split(/(\r?\n)+/g);
    }
    else if (paragraphBreaks == 'double') {
        paragraphs = text.split(/(\r?\n)(\r?\n)+/g);
    }
    else {
        throw new Error(`Invalid paragraph break type: ${paragraphBreaks}`);
    }
    if (whitespace == 'removeLineBreaks') {
        paragraphs = paragraphs.map(p => p.replaceAll(/(\r?\n)+/g, ' '));
    }
    else if (whitespace == 'collapse') {
        paragraphs = paragraphs.map(p => p.replaceAll(/\s+/g, ' '));
    }
    paragraphs = paragraphs.map(p => p.trim());
    paragraphs = paragraphs.filter(p => p.length > 0);
    return paragraphs;
}
export function splitToLines(text) {
    return text.split(/\r?\n/g);
}
//# sourceMappingURL=Segmentation.js.map