import * as readline from 'node:readline';
import { inspect } from 'node:util';
import { randomUUID, randomBytes } from 'node:crypto';
const log = logToStderr;
export function concatFloat32Arrays(arrays) {
    return concatTypedArrays(Float32Array, arrays);
}
function concatTypedArrays(ArrayConstructor, arrays) {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new ArrayConstructor(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
export function shuffleArray(array, randomGen) {
    return shuffleArrayInPlace(array.slice(), randomGen);
}
export function shuffleArrayInPlace(array, randomGen) {
    const vectorCount = array.length;
    for (let i = 0; i < vectorCount - 1; i++) {
        const value = array[i];
        const targetIndex = randomGen.getIntInRange(i + 1, vectorCount);
        array[i] = array[targetIndex];
        array[targetIndex] = value;
    }
    return array;
}
export function simplifyPunctuationCharacters(text) {
    return text
        .replaceAll(`“`, `"`)
        .replaceAll(`”`, `"`)
        .replaceAll(`„`, `"`)
        .replaceAll(`ߵ`, `"`)
        .replaceAll(`ߴ`, `"`)
        .replaceAll(`«`, `"`)
        .replaceAll(`»`, `"`)
        .replaceAll(`’`, `'`)
        .replaceAll(`ʼ`, `'`)
        .replaceAll(`ʼ`, `'`)
        .replaceAll(`＇`, `'`)
        .replaceAll(`，`, `,`)
        .replaceAll(`、`, `,`)
        .replaceAll(`：`, `:`)
        .replaceAll(`；`, `;`)
        .replaceAll(`。`, `.`)
        .replaceAll(`？`, `?`)
        .replaceAll(`！`, `!`)
        .replaceAll(`؟`, `?`);
}
export function writeToStderr(message) {
    process.stderr.write(message);
}
export function printToStderr(message) {
    if (typeof message == 'string') {
        writeToStderr(message);
    }
    else {
        writeToStderr(objToString(message));
    }
}
export function logToStderr(message) {
    printToStderr(message);
    writeToStderr('\n');
}
export function objToString(obj) {
    const formattedString = inspect(obj, {
        showHidden: false,
        depth: null,
        colors: false,
        maxArrayLength: null,
        maxStringLength: null,
        compact: 5,
    });
    return formattedString;
}
export function getRandomHexString(charCount = 32, upperCase = false) {
    if (charCount % 2 !== 0) {
        throw new Error(`'charCount' must be an even number`);
    }
    let hex = randomBytes(charCount / 2).toString('hex');
    if (upperCase) {
        hex = hex.toUpperCase();
    }
    return hex;
}
export function getRandomUUID(dashes = true) {
    let uuid = randomUUID();
    if (dashes == false) {
        uuid = uuid.replaceAll('-', '');
    }
    return uuid;
}
export function sumArray(arr, valueGetter) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += valueGetter(arr[i]);
    }
    return sum;
}
export function includesAnyOf(str, substrings) {
    return indexOfAnyOf(str, substrings) >= 0;
}
export function indexOfAnyOf(str, substrings) {
    for (const substring of substrings) {
        const index = str.indexOf(substring);
        if (index >= 0) {
            return index;
        }
    }
    return -1;
}
export function startsWithAnyOf(str, prefixes) {
    for (const prefix of prefixes) {
        if (str.startsWith(prefix)) {
            return true;
        }
    }
    return false;
}
export function roundToDigits(val, digits = 3) {
    const multiplier = 10 ** digits;
    return Math.round(val * multiplier) / multiplier;
}
export function delay(timeMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeMs);
    });
}
export function yieldToEventLoop() {
    return new Promise((resolve) => {
        setImmediate(resolve);
    });
}
export function printMatrix(matrix) {
    const rowCount = matrix.length;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        log(matrix[rowIndex].join(', '));
    }
}
export function stringifyAndFormatJson(obj) {
    return JSON.stringify(obj, undefined, 4);
}
export function secondsToHMS(totalSeconds) {
    let remainingSeconds = totalSeconds;
    const hours = Math.floor(remainingSeconds / 60 / 60);
    remainingSeconds -= hours * 60 * 60;
    const minutes = Math.floor(remainingSeconds / 60);
    remainingSeconds -= minutes * 60;
    const seconds = Math.floor(remainingSeconds);
    remainingSeconds -= seconds;
    const milliseconds = Math.floor(remainingSeconds * 1000);
    return { hours, minutes, seconds, milliseconds };
}
export function secondsToMS(totalSeconds) {
    const { hours, minutes, seconds, milliseconds } = secondsToHMS(totalSeconds);
    return { minutes: (hours * 60) + minutes, seconds, milliseconds };
}
export function formatHMS(timeHMS, decimalSeparator = '.') {
    return `${formatIntegerWithLeadingZeros(timeHMS.hours, 2)}:${formatIntegerWithLeadingZeros(timeHMS.minutes, 2)}:${formatIntegerWithLeadingZeros(timeHMS.seconds, 2)}${decimalSeparator}${formatIntegerWithLeadingZeros(timeHMS.milliseconds, 3)}`;
}
export function formatMS(timeMS, decimalSeparator = '.') {
    return `${formatIntegerWithLeadingZeros(timeMS.minutes, 2)}:${formatIntegerWithLeadingZeros(timeMS.seconds, 2)}${decimalSeparator}${formatIntegerWithLeadingZeros(timeMS.milliseconds, 3)}`;
}
export function formatIntegerWithLeadingZeros(num, minDigitCount) {
    num = Math.floor(num);
    let numAsString = `${num}`;
    while (numAsString.length < minDigitCount) {
        numAsString = `0${numAsString}`;
    }
    return numAsString;
}
export function intsInRange(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
export function randomIntsInRange(count, min, max) {
    const randomArray = [];
    for (let i = 0; i < count; i++) {
        randomArray.push(randomIntInRange(min, max));
    }
    return randomArray;
}
export function randomIntInRange(min, max) {
    return Math.floor(randomFloatInRange(min, max));
}
export function randomFloatsInRange(count, min = 0.0, max = 1.0) {
    const randomVector = [];
    for (let i = 0; i < count; i++) {
        randomVector.push(randomFloatInRange(min, max));
    }
    return randomVector;
}
export function randomFloatInRange(min, max) {
    return min + Math.random() * (max - min);
}
export function serializeMapToObject(map) {
    const obj = {};
    for (const [key, value] of map) {
        obj[key] = value;
    }
    return obj;
}
export function deserializeObjectToMap(obj) {
    const map = new Map();
    for (const key in obj) {
        map.set(key, obj[key]);
    }
    return map;
}
export function waitTimeout(timeout = 0) {
    return new Promise((resolve) => setTimeout(() => {
        resolve();
    }, timeout));
}
export function waitImmediate() {
    return new Promise((resolve) => setImmediate(() => {
        resolve();
    }));
}
export function waitNextTick() {
    return new Promise((resolve) => process.nextTick(() => resolve()));
}
export function setupUnhandledExceptionListeners() {
    process.on('unhandledRejection', (e) => {
        log(`Unhandled promise rejection:\n ${e}`);
        process.exit(1);
    });
    process.on('uncaughtException', function (e) {
        log(`Uncaught exception:\n ${e}`);
        process.exit(1);
    });
}
export function setupProgramTerminationListeners(cleanupFunc) {
    function exitProcess(exitCode = 0) {
        if (cleanupFunc) {
            cleanupFunc();
        }
        process.exit(exitCode);
    }
    process.on('SIGINT', () => exitProcess(0));
    process.on('SIGQUIT', () => exitProcess(0));
    process.on('SIGTERM', () => exitProcess(0));
    if (process.stdin.isTTY) {
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (str, key) => {
            if (key.name == 'escape') {
                exitProcess(0);
            }
            if (key.ctrl == true && key.name == 'c') {
                exitProcess(0);
            }
        });
    }
}
export function clip(num, min, max) {
    return Math.max(min, Math.min(max, num));
}
export function readBinaryIncomingMessage(incomingMessage) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        incomingMessage.on('data', (chunk) => {
            chunks.push(Buffer.from(chunk));
        });
        incomingMessage.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        incomingMessage.on('error', (e) => {
            reject(e);
        });
    });
}
export function splitFloat32Array(nums, partSize) {
    const result = [];
    for (let offset = 0; offset < nums.length; offset += partSize) {
        result.push(nums.subarray(offset, offset + partSize));
    }
    return result;
}
export async function sha256AsHex(input) {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return hash;
}
export async function commandExists(command) {
    const { default: commandExists } = await import('command-exists');
    try {
        await commandExists(command);
        return true;
    }
    catch {
        return false;
    }
}
export async function convertHtmlToText(html) {
    const { convert } = await import('html-to-text');
    const text = convert(html, {
        wordwrap: null,
        selectors: [
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'img', format: 'skip' },
            { selector: 'h1', options: { uppercase: false } },
            { selector: 'h2', options: { uppercase: false } },
            { selector: 'h3', options: { uppercase: false } },
            { selector: 'h4', options: { uppercase: false } },
            { selector: 'table', options: { uppercaseHeaderCells: false } }
        ]
    });
    return text || '';
}
export function formatListWithQuotedElements(strings, quoteSymbol = `'`) {
    return strings.map(str => `${quoteSymbol}${str}${quoteSymbol}`).join(', ');
}
export async function resolveModuleMainPath(moduleName) {
    const { resolve } = await import('import-meta-resolve');
    const { fileURLToPath } = await import('url');
    return fileURLToPath(resolve(moduleName, import.meta.url));
}
export function getWithDefault(value, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }
    else {
        return value;
    }
}
export function splitFilenameOnExtendedExtension(filenameWithExtension) {
    let splitPoint = filenameWithExtension.length;
    for (let i = filenameWithExtension.length - 1; i >= 0; i--) {
        if (filenameWithExtension[i] == '.') {
            if (/^[a-zA-Z0-9\.]+$/.test(filenameWithExtension.slice(i + 1))) {
                splitPoint = i;
                continue;
            }
            else {
                break;
            }
        }
    }
    const name = filenameWithExtension.slice(0, splitPoint);
    const ext = filenameWithExtension.slice(splitPoint + 1);
    return [name, ext];
}
export function getUTF32Chars(str) {
    const utf32chars = [];
    const mapping = [];
    let utf32Index = 0;
    for (const utf32char of str) {
        utf32chars.push(utf32char);
        for (let i = 0; i < utf32char.length; i++) {
            mapping.push(utf32Index);
        }
        utf32Index += 1;
    }
    mapping.push(utf32Index);
    return { utf32chars, mapping };
}
export function getTokenRepetitionScore(tokens) {
    const maxCycleLength = Math.floor(tokens.length / 2);
    const matchLengthForCycleLength = [0];
    for (let cycleLength = 1; cycleLength <= maxCycleLength; cycleLength++) {
        let matchCount = 0;
        for (let leftIndex = cycleLength; leftIndex < tokens.length; leftIndex++) {
            const referenceIndex = leftIndex - cycleLength;
            if (tokens[leftIndex] !== tokens[referenceIndex]) {
                break;
            }
            matchCount += 1;
        }
        const score = matchCount;
        matchLengthForCycleLength.push(score);
    }
    let longestMatch = -Infinity;
    let longestCycleRepetition = -Infinity;
    for (let i = 1; i <= matchLengthForCycleLength.length; i++) {
        const matchLength = matchLengthForCycleLength[i];
        if (matchLength > longestMatch) {
            longestMatch = matchLength;
        }
        const cycleCount = (matchLength / i) + 1;
        if (cycleCount > longestCycleRepetition) {
            longestCycleRepetition = cycleCount;
        }
    }
    return { longestMatch, longestCycleRepetition };
}
export async function resolveModuleScriptPath(moduleName) {
    const { resolve } = await import('import-meta-resolve');
    const scriptPath = resolve(moduleName, import.meta.url);
    const { fileURLToPath } = await import('url');
    return fileURLToPath(scriptPath);
}
export async function runOperationWithRetries(operationFunc, logger, operationName = 'Operation', delayBetweenRetries = 2000, maxRetries = 200) {
    const { default: chalk } = await import('chalk');
    for (let retryIndex = 1; retryIndex <= maxRetries; retryIndex++) {
        try {
            const result = await operationFunc();
            return result;
        }
        catch (e) {
            const { shouldCancelCurrentTask } = await import('../server/Worker.js');
            if (shouldCancelCurrentTask()) {
                throw new Error('Canceled');
            }
            logger.setAsActiveLogger();
            logger.logTitledMessage(`Error`, e.message, chalk.redBright, 'error');
            logger.log('', 'error');
            logger.logTitledMessage(`${operationName} failed`, `Trying again in ${delayBetweenRetries}ms..`, chalk.redBright, 'error');
            await delay(delayBetweenRetries);
            logger.log(``, 'warning');
            logger.logTitledMessage(`Starting retry attempt`, `${retryIndex} / ${maxRetries}`, chalk.yellowBright, 'warning');
            logger.log(``, 'warning');
            logger.unsetAsActiveLogger();
        }
    }
    throw new Error(`${operationName} failed after ${maxRetries} retry attempts`);
}
export function writeToStdinInChunks(process, buffer, chunkSize) {
    const writeChunk = (chunkOffset) => {
        if (chunkOffset >= buffer.length) {
            process.stdin.end(); // End the stream after writing all chunks
            return;
        }
        const startOffset = chunkOffset;
        const endOffset = Math.min(chunkOffset + chunkSize, buffer.length);
        const chunk = buffer.subarray(startOffset, endOffset);
        if (!process.stdin.writable) {
            return;
        }
        process.stdin.write(chunk, () => writeChunk(endOffset));
    };
    writeChunk(0);
}
export function getIntegerRange(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
export function containsInvalidCodepoint(str) {
    for (const char of str) {
        if (char.codePointAt(0) === 65533) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=Utilities.js.map