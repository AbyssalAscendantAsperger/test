"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToHex = exports.makeDenseArray = exports.parseMethodDescriptor = exports.dottedNameToInternal = exports.internalNameToDotted = exports.isInterface = exports.isAbstract = exports.isNative = exports.isFinal = exports.isStatic = exports.isProtected = exports.isPrivate = exports.isPublic = void 0;
const constants_1 = require("./constants");
function isPublic(flags) {
    return (flags & constants_1.AccessFlags.PUBLIC) !== 0;
}
exports.isPublic = isPublic;
function isPrivate(flags) {
    return (flags & constants_1.AccessFlags.PRIVATE) !== 0;
}
exports.isPrivate = isPrivate;
function isProtected(flags) {
    return (flags & constants_1.AccessFlags.PROTECTED) !== 0;
}
exports.isProtected = isProtected;
function isStatic(flags) {
    return (flags & constants_1.AccessFlags.STATIC) !== 0;
}
exports.isStatic = isStatic;
function isFinal(flags) {
    return (flags & constants_1.AccessFlags.FINAL) !== 0;
}
exports.isFinal = isFinal;
function isNative(flags) {
    return (flags & constants_1.AccessFlags.NATIVE) !== 0;
}
exports.isNative = isNative;
function isAbstract(flags) {
    return (flags & constants_1.AccessFlags.ABSTRACT) !== 0;
}
exports.isAbstract = isAbstract;
function isInterface(flags) {
    return (flags & constants_1.AccessFlags.INTERFACE) !== 0;
}
exports.isInterface = isInterface;
function internalNameToDotted(internalName) {
    return internalName.replace(/\//g, ".");
}
exports.internalNameToDotted = internalNameToDotted;
function dottedNameToInternal(dottedName) {
    return dottedName.replace(/\./g, "/");
}
exports.dottedNameToInternal = dottedNameToInternal;
function parseMethodDescriptor(descriptor) {
    const params = [];
    let i = 1;
    while (descriptor[i] !== ")") {
        const param = readTypeDescriptor(descriptor, i);
        params.push(param);
        i += param.length;
    }
    const returnType = descriptor.substring(i + 1);
    return { params, returnType };
}
exports.parseMethodDescriptor = parseMethodDescriptor;
function readTypeDescriptor(descriptor, start) {
    const ch = descriptor[start];
    if ("BCDFIJSZ".includes(ch)) {
        return ch;
    }
    if (ch === "L") {
        const end = descriptor.indexOf(";", start);
        return descriptor.substring(start, end + 1);
    }
    if (ch === "[") {
        return "[" + readTypeDescriptor(descriptor, start + 1);
    }
    throw new Error(`Invalid type descriptor at position ${start}: ${descriptor}`);
}
function makeDenseArray(size, defaultValue) {
    const arr = new Array(size);
    for (let i = 0; i < size; i++) {
        arr[i] = defaultValue;
    }
    return arr;
}
exports.makeDenseArray = makeDenseArray;
function bytesToHex(bytes, maxLength = 16) {
    const len = Math.min(bytes.length, maxLength);
    const hex = Array.from(bytes.slice(0, len))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
    return bytes.length > maxLength ? `${hex}...` : hex;
}
exports.bytesToHex = bytesToHex;
//# sourceMappingURL=utils.js.map