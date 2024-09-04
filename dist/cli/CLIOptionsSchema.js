export function getOptionTypeFromSchema(path, schema) {
    const definitions = schema.definitions;
    let currentObject = definitions;
    for (let keyIndex = 0; keyIndex < path.length; keyIndex++) {
        const isLastKey = keyIndex == path.length - 1;
        const key = path[keyIndex];
        currentObject = currentObject[key];
        if (!currentObject) {
            throw new Error(`'${key}' is not a valid property of '${path.slice(0, keyIndex).join('.')}'.`);
        }
        if ('$ref' in currentObject) {
            const refString = currentObject['$ref'];
            const parsedRef = refString.substring(refString.lastIndexOf('/') + 1);
            currentObject = definitions[parsedRef];
        }
        const currentObjectType = currentObject['type'];
        if (isLastKey) {
            let possibleValues = undefined;
            if ('enum' in currentObject) {
                possibleValues = currentObject['enum'];
            }
            else if ('const' in currentObject) {
                possibleValues = [currentObject['const']];
            }
            const isUnion = ('anyOf' in currentObject);
            return { type: currentObjectType, enum: possibleValues, isUnion };
        }
        if (currentObjectType == 'object') {
            currentObject = currentObject['properties'];
        }
        else {
            throw new Error(`Property '${key}' is not an object, but has type ${currentObjectType}`);
        }
    }
    return {};
}
//# sourceMappingURL=CLIOptionsSchema.js.map