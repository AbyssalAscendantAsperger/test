"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringPool = exports.JavaString = void 0;
const object_1 = require("./object");
const array_1 = require("./array");
class JavaString extends object_1.JavaObject {
    constructor(classInfo, value) {
        super(classInfo);
        this.jsString = value;
        this.charArray = array_1.JavaArray.createFromDescriptor("C", value.length);
        for (let i = 0; i < value.length; i++) {
            this.charArray.set(i, value.charCodeAt(i));
        }
    }
    getValue() {
        return this.jsString;
    }
    getCharArray() {
        return this.charArray;
    }
    length() {
        return this.jsString.length;
    }
    charAt(index) {
        if (index < 0 || index >= this.jsString.length) {
            throw new Error(`StringIndexOutOfBoundsException: ${index}`);
        }
        return this.jsString.charCodeAt(index);
    }
    concat(other) {
        const newValue = this.jsString + other.jsString;
        return new JavaString(this.classInfo, newValue);
    }
    substring(beginIndex, endIndex) {
        const newValue = this.jsString.substring(beginIndex, endIndex);
        return new JavaString(this.classInfo, newValue);
    }
    toLowerCase() {
        const newValue = this.jsString.toLowerCase();
        return new JavaString(this.classInfo, newValue);
    }
    toUpperCase() {
        const newValue = this.jsString.toUpperCase();
        return new JavaString(this.classInfo, newValue);
    }
    trim() {
        const newValue = this.jsString.trim();
        return new JavaString(this.classInfo, newValue);
    }
    equals(other) {
        return this.jsString === other.jsString;
    }
    compareTo(other) {
        if (this.jsString < other.jsString)
            return -1;
        if (this.jsString > other.jsString)
            return 1;
        return 0;
    }
    startsWith(prefix) {
        return this.jsString.startsWith(prefix);
    }
    endsWith(suffix) {
        return this.jsString.endsWith(suffix);
    }
    indexOf(str, fromIndex = 0) {
        return this.jsString.indexOf(str, fromIndex);
    }
    toString() {
        return this.jsString;
    }
}
exports.JavaString = JavaString;
class StringPool {
    constructor() {
        this.pool = new Map();
    }
    intern(classInfo, value) {
        let javaString = this.pool.get(value);
        if (!javaString) {
            javaString = new JavaString(classInfo, value);
            this.pool.set(value, javaString);
        }
        return javaString;
    }
    clear() {
        this.pool.clear();
    }
    size() {
        return this.pool.size;
    }
}
exports.StringPool = StringPool;
//# sourceMappingURL=string.js.map