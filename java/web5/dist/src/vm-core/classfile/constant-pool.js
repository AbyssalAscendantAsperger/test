"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantPool = void 0;
const constants_1 = require("../core/constants");
const reader_1 = require("./reader");
class ConstantPool {
    constructor(reader) {
        this.buffer = reader["buffer"];
        this.entries = new Uint32Array(0);
        this.resolved = [];
        this.scanEntries(reader);
    }
    scanEntries(reader) {
        const count = reader.readU2();
        this.entries = new Uint32Array(count);
        this.resolved = new Array(count);
        this.entries[0] = 0;
        this.resolved[0] = undefined;
        let offset = reader.getOffset();
        for (let i = 1; i < count; i++) {
            this.entries[i] = offset;
            const tag = this.buffer[offset];
            offset++;
            if (tag === constants_1.ConstantTag.Utf8) {
                const length = (this.buffer[offset] << 8) | this.buffer[offset + 1];
                offset += 2 + length;
            }
            else if (tag in constants_1.CONSTANT_TAG_SIZE) {
                offset += constants_1.CONSTANT_TAG_SIZE[tag];
            }
            else {
                throw new Error(`Unknown constant pool tag: ${tag} at index ${i}`);
            }
            if (tag === constants_1.ConstantTag.Long || tag === constants_1.ConstantTag.Double) {
                i++;
                if (i < count) {
                    this.entries[i] = 0;
                }
            }
        }
        reader.setOffset(offset);
    }
    get(index) {
        if (index <= 0 || index >= this.entries.length) {
            throw new Error(`Invalid constant pool index: ${index}`);
        }
        if (this.resolved[index]) {
            return this.resolved[index];
        }
        const entry = this.parseEntry(index);
        this.resolved[index] = entry;
        return entry;
    }
    parseEntry(index) {
        const offset = this.entries[index];
        const tag = this.buffer[offset];
        const reader = new reader_1.ClassFileReader(this.buffer);
        reader.setOffset(offset + 1);
        switch (tag) {
            case constants_1.ConstantTag.Utf8:
                return this.parseUtf8(reader);
            case constants_1.ConstantTag.Integer:
                return { tag: constants_1.ConstantTag.Integer, value: reader.readI4() };
            case constants_1.ConstantTag.Float:
                return { tag: constants_1.ConstantTag.Float, value: reader.readFloat() };
            case constants_1.ConstantTag.Long:
                return { tag: constants_1.ConstantTag.Long, value: reader.readI8() };
            case constants_1.ConstantTag.Double:
                return { tag: constants_1.ConstantTag.Double, value: reader.readDouble() };
            case constants_1.ConstantTag.Class:
                return { tag: constants_1.ConstantTag.Class, nameIndex: reader.readU2() };
            case constants_1.ConstantTag.String:
                return { tag: constants_1.ConstantTag.String, stringIndex: reader.readU2() };
            case constants_1.ConstantTag.Fieldref:
                return {
                    tag: constants_1.ConstantTag.Fieldref,
                    classIndex: reader.readU2(),
                    nameAndTypeIndex: reader.readU2(),
                };
            case constants_1.ConstantTag.Methodref:
                return {
                    tag: constants_1.ConstantTag.Methodref,
                    classIndex: reader.readU2(),
                    nameAndTypeIndex: reader.readU2(),
                };
            case constants_1.ConstantTag.InterfaceMethodref:
                return {
                    tag: constants_1.ConstantTag.InterfaceMethodref,
                    classIndex: reader.readU2(),
                    nameAndTypeIndex: reader.readU2(),
                };
            case constants_1.ConstantTag.NameAndType:
                return {
                    tag: constants_1.ConstantTag.NameAndType,
                    nameIndex: reader.readU2(),
                    descriptorIndex: reader.readU2(),
                };
            default:
                throw new Error(`Unsupported constant pool tag: ${tag}`);
        }
    }
    parseUtf8(reader) {
        const length = reader.readU2();
        const bytes = reader.readUtf8Bytes(length);
        return {
            tag: constants_1.ConstantTag.Utf8,
            bytes,
            value: undefined,
        };
    }
    getUtf8(index) {
        const entry = this.get(index);
        if (entry.tag !== constants_1.ConstantTag.Utf8) {
            throw new Error(`Expected UTF-8 constant at index ${index}, got tag ${entry.tag}`);
        }
        if (!entry.value) {
            entry.value = new TextDecoder("utf-8").decode(entry.bytes);
        }
        return entry.value;
    }
    getClassName(index) {
        const entry = this.get(index);
        if (entry.tag !== constants_1.ConstantTag.Class) {
            throw new Error(`Expected Class constant at index ${index}`);
        }
        return this.getUtf8(entry.nameIndex);
    }
    getString(index) {
        const entry = this.get(index);
        if (entry.tag !== constants_1.ConstantTag.String) {
            throw new Error(`Expected String constant at index ${index}`);
        }
        return this.getUtf8(entry.stringIndex);
    }
    getFieldRef(index) {
        const entry = this.get(index);
        if (entry.tag !== constants_1.ConstantTag.Fieldref) {
            throw new Error(`Expected Fieldref constant at index ${index}`);
        }
        const className = this.getClassName(entry.classIndex);
        const nameAndType = this.get(entry.nameAndTypeIndex);
        const fieldName = this.getUtf8(nameAndType.nameIndex);
        const descriptor = this.getUtf8(nameAndType.descriptorIndex);
        return { className, fieldName, descriptor };
    }
    getMethodRef(index) {
        const entry = this.get(index);
        if (entry.tag !== constants_1.ConstantTag.Methodref &&
            entry.tag !== constants_1.ConstantTag.InterfaceMethodref) {
            throw new Error(`Expected Methodref constant at index ${index}`);
        }
        const className = this.getClassName(entry.classIndex);
        const nameAndType = this.get(entry.nameAndTypeIndex);
        const methodName = this.getUtf8(nameAndType.nameIndex);
        const descriptor = this.getUtf8(nameAndType.descriptorIndex);
        return { className, methodName, descriptor };
    }
    getSize() {
        return this.entries.length;
    }
}
exports.ConstantPool = ConstantPool;
//# sourceMappingURL=constant-pool.js.map