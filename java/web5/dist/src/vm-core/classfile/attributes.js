"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeParser = void 0;
class AttributeParser {
    constructor(reader, constantPool) {
        this.reader = reader;
        this.constantPool = constantPool;
    }
    parseAttributes() {
        const count = this.reader.readU2();
        const attributes = [];
        for (let i = 0; i < count; i++) {
            attributes.push(this.parseAttribute());
        }
        return attributes;
    }
    parseAttribute() {
        const nameIndex = this.reader.readU2();
        const length = this.reader.readU4();
        const name = this.constantPool.getUtf8(nameIndex);
        switch (name) {
            case "Code":
                return this.parseCodeAttribute(name, length);
            case "SourceFile":
                return this.parseSourceFileAttribute(name);
            case "LineNumberTable":
                return this.parseLineNumberTableAttribute(name);
            case "LocalVariableTable":
                return this.parseLocalVariableTableAttribute(name);
            default:
                return {
                    name,
                    data: this.reader.readBytes(length),
                };
        }
    }
    parseCodeAttribute(name, length) {
        const maxStack = this.reader.readU2();
        const maxLocals = this.reader.readU2();
        const codeLength = this.reader.readU4();
        const code = this.reader.readBytes(codeLength);
        const exceptionTableLength = this.reader.readU2();
        const exceptionTable = [];
        for (let i = 0; i < exceptionTableLength; i++) {
            exceptionTable.push({
                startPc: this.reader.readU2(),
                endPc: this.reader.readU2(),
                handlerPc: this.reader.readU2(),
                catchType: this.reader.readU2(),
            });
        }
        const attributes = this.parseAttributes();
        return {
            name: "Code",
            data: new Uint8Array(0),
            maxStack,
            maxLocals,
            code,
            exceptionTable,
            attributes,
        };
    }
    parseSourceFileAttribute(name) {
        const sourceFileIndex = this.reader.readU2();
        const sourceFile = this.constantPool.getUtf8(sourceFileIndex);
        return {
            name: "SourceFile",
            data: new Uint8Array(0),
            sourceFile,
        };
    }
    parseLineNumberTableAttribute(name) {
        const tableLength = this.reader.readU2();
        const lineNumberTable = [];
        for (let i = 0; i < tableLength; i++) {
            lineNumberTable.push({
                startPc: this.reader.readU2(),
                lineNumber: this.reader.readU2(),
            });
        }
        return {
            name: "LineNumberTable",
            data: new Uint8Array(0),
            lineNumberTable,
        };
    }
    parseLocalVariableTableAttribute(name) {
        const tableLength = this.reader.readU2();
        const localVariableTable = [];
        for (let i = 0; i < tableLength; i++) {
            const startPc = this.reader.readU2();
            const length = this.reader.readU2();
            const nameIndex = this.reader.readU2();
            const descriptorIndex = this.reader.readU2();
            const index = this.reader.readU2();
            localVariableTable.push({
                startPc,
                length,
                name: this.constantPool.getUtf8(nameIndex),
                descriptor: this.constantPool.getUtf8(descriptorIndex),
                index,
            });
        }
        return {
            name: "LocalVariableTable",
            data: new Uint8Array(0),
            localVariableTable,
        };
    }
}
exports.AttributeParser = AttributeParser;
//# sourceMappingURL=attributes.js.map