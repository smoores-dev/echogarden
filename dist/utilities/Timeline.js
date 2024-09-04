import { isWordOrSymbolWord, splitToParagraphs, splitToSentences } from '../nlp/Segmentation.js';
import { deepClone } from './ObjectUtilities.js';
import { getUTF32Chars, roundToDigits } from './Utilities.js';
export function addTimeOffsetToTimeline(targetTimeline, timeOffset) {
    if (!targetTimeline) {
        return targetTimeline;
    }
    const newTimeline = deepClone(targetTimeline);
    for (const segmentTimelineEntry of newTimeline) {
        segmentTimelineEntry.startTime = Math.max(segmentTimelineEntry.startTime + timeOffset, 0);
        segmentTimelineEntry.endTime = Math.max(segmentTimelineEntry.endTime + timeOffset, 0);
        if (segmentTimelineEntry.timeline) {
            segmentTimelineEntry.timeline = addTimeOffsetToTimeline(segmentTimelineEntry.timeline, timeOffset);
        }
    }
    return newTimeline;
}
export function multiplyTimelineByFactor(targetTimeline, factor) {
    const newTimeline = deepClone(targetTimeline);
    for (const segmentTimelineEntry of newTimeline) {
        segmentTimelineEntry.startTime = segmentTimelineEntry.startTime * factor;
        segmentTimelineEntry.endTime = segmentTimelineEntry.endTime * factor;
        if (segmentTimelineEntry.timeline) {
            segmentTimelineEntry.timeline = multiplyTimelineByFactor(segmentTimelineEntry.timeline, factor);
        }
    }
    return newTimeline;
}
export function roundTimelineProperties(targetTimeline, decimalDigits = 2) {
    const roundedTimeline = deepClone(targetTimeline);
    for (const entry of roundedTimeline) {
        if (entry.startTime) {
            entry.startTime = roundToDigits(entry.startTime, decimalDigits);
        }
        if (entry.endTime) {
            entry.endTime = roundToDigits(entry.endTime, decimalDigits);
        }
        if (entry.confidence) {
            entry.confidence = roundToDigits(entry.confidence, decimalDigits);
        }
        if (entry.timeline) {
            entry.timeline = roundTimelineProperties(entry.timeline);
        }
    }
    return roundedTimeline;
}
export async function wordTimelineToSegmentSentenceTimeline(wordTimeline, transcript, language, paragraphBreaks = 'double', whitespace = 'collapse') {
    const paragraphs = splitToParagraphs(transcript, paragraphBreaks, whitespace);
    const segments = paragraphs
        .map(segment => splitToSentences(segment, language).map(sentence => sentence.trim()));
    let text = '';
    const charIndexToSentenceEntryMapping = [];
    const segmentTimeline = [];
    for (const segment of segments) {
        const sentencesInSegment = [];
        const segmentEntry = {
            type: 'segment',
            text: '',
            startTime: -1,
            endTime: -1,
            timeline: sentencesInSegment
        };
        for (const sentence of segment) {
            const sentenceEntry = {
                type: 'sentence',
                text: sentence,
                startTime: -1,
                endTime: -1,
                timeline: []
            };
            for (const char of sentence + ' ') {
                text += char;
                charIndexToSentenceEntryMapping.push(sentenceEntry);
            }
            sentencesInSegment.push(sentenceEntry);
        }
        segmentTimeline.push(segmentEntry);
    }
    let wordSearchStartOffset = 0;
    for (let wordIndex = 0; wordIndex < wordTimeline.length; wordIndex++) {
        const wordEntry = wordTimeline[wordIndex];
        const wordText = wordEntry.text;
        if (!isWordOrSymbolWord(wordText)) {
            continue;
        }
        const indexOfWordInText = text.indexOf(wordText, wordSearchStartOffset);
        if (indexOfWordInText == -1) {
            throw new Error(`Couldn't find the word '${wordText}' in the text at start position ${wordSearchStartOffset}`);
        }
        const targetSentenceEntry = charIndexToSentenceEntryMapping[indexOfWordInText];
        targetSentenceEntry.timeline.push(deepClone(wordEntry));
        wordSearchStartOffset = indexOfWordInText + wordText.length;
    }
    const newSegmentTimeline = [];
    for (const segmentEntry of segmentTimeline) {
        const oldSentenceTimeline = segmentEntry.timeline;
        const newSentenceTimeline = [];
        for (const sentenceEntry of oldSentenceTimeline) {
            const wordTimeline = sentenceEntry.timeline;
            if (!wordTimeline || wordTimeline.length == 0) {
                continue;
            }
            sentenceEntry.startTime = wordTimeline[0].startTime;
            sentenceEntry.endTime = wordTimeline[wordTimeline.length - 1].endTime;
            newSentenceTimeline.push(sentenceEntry);
        }
        if (newSentenceTimeline.length == 0) {
            continue;
        }
        segmentEntry.text = newSentenceTimeline.map(sentenceEntry => sentenceEntry.text).join(' ');
        segmentEntry.startTime = newSentenceTimeline[0].startTime;
        segmentEntry.endTime = newSentenceTimeline[newSentenceTimeline.length - 1].endTime;
        newSegmentTimeline.push(segmentEntry);
    }
    return { segmentTimeline: newSegmentTimeline };
}
export function addWordTextOffsetsToTimeline(timeline, text, currentOffset = 0) {
    const { mapping } = getUTF32Chars(text);
    for (const entry of timeline) {
        if (entry.type == 'word') {
            let word = entry.text;
            word = word.trim().replaceAll(/\s+/g, ' ');
            const wordParts = word.split(' ');
            let startOffset;
            let endOffset;
            for (let i = 0; i < wordParts.length; i++) {
                let wordPart = wordParts[i];
                let wordPartOffset = text.indexOf(wordPart, currentOffset);
                if (wordPartOffset == -1) {
                    continue;
                }
                currentOffset = wordPartOffset + wordParts[i].length;
                if (i == 0) {
                    startOffset = wordPartOffset;
                }
                endOffset = currentOffset;
            }
            entry.startOffsetUtf16 = startOffset;
            entry.endOffsetUtf16 = endOffset;
            entry.startOffsetUtf32 = startOffset != undefined ? mapping[startOffset] : undefined;
            entry.endOffsetUtf32 = endOffset != undefined ? mapping[endOffset] : undefined;
        }
        else if (entry.timeline) {
            currentOffset = addWordTextOffsetsToTimeline(entry.timeline, text, currentOffset);
        }
    }
    return currentOffset;
}
export function extractEntries(timeline, predicate) {
    const timelineWordEntries = [];
    for (const entry of timeline) {
        if (predicate(entry)) {
            timelineWordEntries.push(entry);
        }
        else if (entry.timeline) {
            timelineWordEntries.push(...extractEntries(entry.timeline, predicate));
        }
    }
    return timelineWordEntries;
}
//# sourceMappingURL=Timeline.js.map