export function extendDeep(base, extension) {
    const baseClone = deepClone(base);
    if (isPlainObject(base) && extension === undefined) {
        return baseClone;
    }
    const extensionClone = deepClone(extension);
    if (!isPlainObject(base) || !isPlainObject(extension)) {
        return extensionClone;
    }
    for (const propName in extensionClone) {
        if (!extensionClone.hasOwnProperty(propName)) {
            continue;
        }
        baseClone[propName] = extendDeep(baseClone[propName], extensionClone[propName]);
    }
    return baseClone;
}
export function shallowClone(val) {
    return clone(val, false);
}
export function deepClone(val) {
    return clone(val, true);
}
function clone(val, deep = true, seenObjects = []) {
    if (val == null || typeof val !== 'object') {
        return val;
    }
    const obj = val;
    const prototypeIdentifier = toString.call(obj);
    switch (prototypeIdentifier) {
        case '[object Array]': {
            if (seenObjects.includes(obj)) {
                throw new Error('deepClone: encountered a cyclic object');
            }
            seenObjects.push(obj);
            const clonedArray = new Array(obj.length);
            for (let i = 0; i < obj.length; i++) {
                if (deep) {
                    clonedArray[i] = clone(obj[i], true, seenObjects);
                }
                else {
                    clonedArray[i] = obj[i];
                }
            }
            seenObjects.pop();
            return clonedArray;
        }
        case '[object ArrayBuffer]': {
            const clonedArray = new Uint8Array(obj.byteLength);
            clonedArray.set(new Uint8Array(obj));
            return clonedArray.buffer;
        }
        case '[object Int8Array]': {
            const clonedArray = new Int8Array(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Uint8Array]': {
            const clonedArray = new Uint8Array(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Uint8ClampedArray]': {
            const clonedArray = new Uint8ClampedArray(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Int16Array]': {
            const clonedArray = new Int16Array(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Uint16Array]': {
            const clonedArray = new Uint16Array(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Int32Array]': {
            const clonedArray = new Int32Array(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Uint32Array]': {
            const clonedArray = new Uint32Array(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Float32Array]': {
            const clonedArray = new Float32Array(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Float64Array]': {
            const clonedArray = new Float64Array(obj.length);
            clonedArray.set(obj);
            return clonedArray;
        }
        case '[object Date]': {
            return new Date(obj.valueOf());
        }
        case '[object RegExp]': {
            return obj;
        }
        case '[object Function]': {
            return obj;
        }
        case '[object Object]': {
            if (seenObjects.includes(obj)) {
                throw new Error('deepClone: encountered a cyclic object');
            }
            seenObjects.push(obj);
            const clonedObj = {};
            for (const propName in obj) {
                if (!obj.hasOwnProperty(propName)) {
                    continue;
                }
                if (deep) {
                    clonedObj[propName] = clone(obj[propName], true, seenObjects);
                }
                else {
                    clonedObj[propName] = obj[propName];
                }
            }
            seenObjects.pop();
            return clonedObj;
        }
        default: {
            throw new Error(`Cloning of type ${prototypeIdentifier} is not supported`);
        }
    }
}
export function isPlainObject(val) {
    return val != null && typeof val === 'object' && toString.call(val) === '[object Object]';
}
//# sourceMappingURL=ObjectUtilities.js.map