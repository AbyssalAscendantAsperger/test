"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMethods = exports.MethodInfo = void 0;
const utils_1 = require("../core/utils");
const attributes_1 = require("./attributes");
class MethodInfo {
    constructor(reader, constantPool) {
        this.accessFlags = reader.readU2();
        const nameIndex = reader.readU2();
        this.name = constantPool.getUtf8(nameIndex);
        const descriptorIndex = reader.readU2();
        this.descriptor = constantPool.getUtf8(descriptorIndex);
        const attrParser = new attributes_1.AttributeParser(reader, constantPool);
        this.attributes = attrParser.parseAttributes();
    }
    isStatic() {
        return (0, utils_1.isStatic)(this.accessFlags);
    }
    isFinal() {
        return (0, utils_1.isFinal)(this.accessFlags);
    }
    isPublic() {
        return (0, utils_1.isPublic)(this.accessFlags);
    }
    isPrivate() {
        return (0, utils_1.isPrivate)(this.accessFlags);
    }
    isProtected() {
        return (0, utils_1.isProtected)(this.accessFlags);
    }
    isNative() {
        return (0, utils_1.isNative)(this.accessFlags);
    }
    isAbstract() {
        return (0, utils_1.isAbstract)(this.accessFlags);
    }
    isConstructor() {
        return this.name === "<init>";
    }
    isStaticInitializer() {
        return this.name === "<clinit>";
    }
    getParameterTypes() {
        if (!this._paramTypes) {
            const parsed = (0, utils_1.parseMethodDescriptor)(this.descriptor);
            this._paramTypes = parsed.params;
        }
        return this._paramTypes;
    }
    getReturnType() {
        if (!this._returnType) {
            const parsed = (0, utils_1.parseMethodDescriptor)(this.descriptor);
            this._returnType = parsed.returnType;
        }
        return this._returnType;
    }
    getParameterCount() {
        return this.getParameterTypes().length;
    }
    getSignature() {
        return `${this.name}${this.descriptor}`;
    }
    getCode() {
        if (this._code === undefined) {
            this._code = this.attributes.find((attr) => attr.name === "Code");
        }
        return this._code;
    }
    hasCode() {
        return this.getCode() !== undefined;
    }
    toString() {
        const flags = [];
        if (this.isPublic())
            flags.push("public");
        if (this.isPrivate())
            flags.push("private");
        if (this.isProtected())
            flags.push("protected");
        if (this.isStatic())
            flags.push("static");
        if (this.isFinal())
            flags.push("final");
        if (this.isNative())
            flags.push("native");
        if (this.isAbstract())
            flags.push("abstract");
        const params = this.getParameterTypes().join(", ");
        const returnType = this.getReturnType();
        return `${flags.join(" ")} ${returnType} ${this.name}(${params})`;
    }
}
exports.MethodInfo = MethodInfo;
function parseMethods(reader, constantPool) {
    const count = reader.readU2();
    const methods = [];
    for (let i = 0; i < count; i++) {
        methods.push(new MethodInfo(reader, constantPool));
    }
    return methods;
}
exports.parseMethods = parseMethods;
//# sourceMappingURL=method-info.js.map