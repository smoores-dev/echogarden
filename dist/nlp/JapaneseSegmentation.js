import path from 'path';
import { OpenPromise } from '../utilities/OpenPromise.js';
import { resolveModuleScriptPath } from '../utilities/Utilities.js';
export async function splitJapaneseTextToWords_Kuromoji(text) {
    const tokenizer = await getKuromojiTokenizer();
    const results = tokenizer.tokenize(text);
    const words = results.map(entry => entry.surface_form);
    return words;
}
let kuromojiTokenizer;
async function getKuromojiTokenizer() {
    if (kuromojiTokenizer) {
        return kuromojiTokenizer;
    }
    const { default: kuromoji } = await import('kuromoji');
    const resultOpenPromise = new OpenPromise();
    const kuromojiScriptPath = await resolveModuleScriptPath('kuromoji');
    const dictionaryPath = path.join(path.dirname(kuromojiScriptPath), '..', '/dict');
    kuromoji.builder({ dicPath: dictionaryPath }).build(function (error, tokenizer) {
        if (error) {
            resultOpenPromise.reject(error);
            return;
        }
        kuromojiTokenizer = tokenizer;
        resultOpenPromise.resolve(kuromojiTokenizer);
    });
    return resultOpenPromise.promise;
}
/*
export async function splitJapaneseTextToWords_Sudachi(text: string, mode: 0 | 1 | 2) {
    const { TokenizeMode, tokenize } = await import('sudachi')

    const resultString = tokenize(text, mode)

    const parsedResult: any[] = JSON.parse(resultString)
    const result = parsedResult.map(entry => entry.surface)

    return result
}
*/
//# sourceMappingURL=JapaneseSegmentation.js.map