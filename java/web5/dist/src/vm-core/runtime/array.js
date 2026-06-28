"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescriptorFromArrayType = exports.getArrayTypeFromDescriptor = exports.JavaArray = exports.ArrayType = void 0;
const object_1 = require("./object");
var ArrayType;
(function (ArrayType) {
    ArrayType[ArrayType["BOOLEAN"] = 4] = "BOOLEAN";
    ArrayType[ArrayType["CHAR"] = 5] = "CHAR";
    ArrayType[ArrayType["FLOAT"] = 6] = "FLOAT";
    ArrayType[ArrayType["DOUBLE"] = 7] = "DOUBLE";
    ArrayType[ArrayType["BYTE"] = 8] = "BYTE";
    ArrayType[ArrayType["SHORT"] = 9] = "SHORT";
    ArrayType[ArrayType["INT"] = 10] = "INT";
    ArrayType[ArrayType["LONG"] = 11] = "LONG";
    ArrayType[ArrayType["OBJECT"] = 100] = "OBJECT";
})(ArrayType = exports.ArrayType || (exports.ArrayType = {}));
class JavaArray extends object_1.JavaObject {
    constructor(classInfo, componentType, length) {
        super(classInfo);
        this.componentType = componentType;
        this.length = length;
        this.elements = new Array(length);
        this.initializeElements();
    }
    static createFromDescriptor(descriptor, length) {
        const componentType = getArrayTypeFromDescriptor(descriptor);
        const arrayClassName = descriptor.startsWith('[') ? descriptor : `[${descriptor}`;
        const mockClassInfo = {
            thisClass: arrayClassName,
            superClass: 'java/lang/Object',
            interfaces: [],
            accessFlags: 0x0001,
            fields: [],
            methods: [],
            constantPool: { getSize: () => 0 },
            isPublic: () => true,
            isFinal: () => true,
            isInterface: () => false,
            isAbstract: () => false,
            getJavaVersion: () => "1.0",
            getInstanceFields: () => [],
            getStaticFields: () => [],
        };
        return new JavaArray(mockClassInfo, componentType, length);
    }
    initializeElements() {
        const defaultValue = this.getArrayDefaultValue();
        for (let i = 0; i < this.length; i++) {
            this.elements[i] = defaultValue;
        }
    }
    getArrayDefaultValue() {
        switch (this.componentType) {
            case ArrayType.BOOLEAN:
            case ArrayType.BYTE:
            case ArrayType.CHAR:
            case ArrayType.SHORT:
            case ArrayType.INT:
                return 0;
            case ArrayType.LONG:
                return 0n;
            case ArrayType.FLOAT:
            case ArrayType.DOUBLE:
                return 0.0;
            case ArrayType.OBJECT:
                return null;
            default:
                return null;
        }
    }
    getElement(index) {
        if (index < 0 || index >= this.length) {
            throw new Error(`ArrayIndexOutOfBoundsException: ${index} (length: ${this.length})`);
        }
        return this.elements[index];
    }
    setElement(index, value) {
        if (index < 0 || index >= this.length) {
            throw new Error(`ArrayIndexOutOfBoundsException: ${index} (length: ${this.length})`);
        }
        if (!this.isValidElement(value)) {
            throw new Error(`ArrayStoreException: Cannot store ${typeof value} in ${ArrayType[this.componentType]} array`);
        }
        this.elements[index] = value;
    }
    isValidElement(value) {
        if (value === null) {
            return true;
        }
        switch (this.componentType) {
            case ArrayType.BOOLEAN:
                return typeof value === 'boolean' || (typeof value === 'number' && (value === 0 || value === 1));
            case ArrayType.BYTE:
            case ArrayType.CHAR:
            case ArrayType.SHORT:
            case ArrayType.INT:
                return typeof value === 'number' && Number.isInteger(value);
            case ArrayType.LONG:
                return typeof value === 'bigint';
            case ArrayType.FLOAT:
            case ArrayType.DOUBLE:
                return typeof value === 'number';
            case ArrayType.OBJECT:
                return value instanceof object_1.JavaObject;
            default:
                return false;
        }
    }
    getElements() {
        return [...this.elements];
    }
    get(index) {
        return this.getElement(index);
    }
    set(index, value) {
        this.setElement(index, value);
    }
    copyTo(dest, srcPos, destPos, length) {
        if (srcPos < 0 || destPos < 0 || length < 0) {
            throw new Error("IndexOutOfBoundsException: negative index or length");
        }
        if (srcPos + length > this.length) {
            throw new Error("IndexOutOfBoundsException: source array overflow");
        }
        if (destPos + length > dest.length) {
            throw new Error("IndexOutOfBoundsException: destination array overflow");
        }
        for (let i = 0; i < length; i++) {
            dest.setElement(destPos + i, this.elements[srcPos + i]);
        }
    }
    printElements() {
        return `[${this.elements.map(e => String(e)).join(', ')}]`;
    }
    isPrimitiveArray() {
        return this.componentType !== ArrayType.OBJECT;
    }
}
exports.JavaArray = JavaArray;
function getArrayTypeFromDescriptor(descriptor) {
    switch (descriptor) {
        case 'Z': return ArrayType.BOOLEAN;
        case 'B': return ArrayType.BYTE;
        case 'C': return ArrayType.CHAR;
        case 'S': return ArrayType.SHORT;
        case 'I': return ArrayType.INT;
        case 'J': return ArrayType.LONG;
        case 'F': return ArrayType.FLOAT;
        case 'D': return ArrayType.DOUBLE;
        default:
            if (descriptor.startsWith('L') || descriptor.startsWith('[')) {
                return ArrayType.OBJECT;
            }
            throw new Error(`Unknown array type descriptor: ${descriptor}`);
    }
}
exports.getArrayTypeFromDescriptor = getArrayTypeFromDescriptor;
function getDescriptorFromArrayType(arrayType) {
    switch (arrayType) {
        case ArrayType.BOOLEAN: return 'Z';
        case ArrayType.BYTE: return 'B';
        case ArrayType.CHAR: return 'C';
        case ArrayType.SHORT: return 'S';
        case ArrayType.INT: return 'I';
        case ArrayType.LONG: return 'J';
        case ArrayType.FLOAT: return 'F';
        case ArrayType.DOUBLE: return 'D';
        case ArrayType.OBJECT: return 'Ljava/lang/Object;';
        default: throw new Error(`Unknown array type: ${arrayType}`);
    }
}
exports.getDescriptorFromArrayType = getDescriptorFromArrayType;
//# sourceMappingURL=array.js.map