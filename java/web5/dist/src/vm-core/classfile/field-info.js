"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFields = exports.FieldInfo = void 0;
const utils_1 = require("../core/utils");
const attributes_1 = require("./attributes");
class FieldInfo {
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
    isPrimitive() {
        const desc = this.descriptor;
        return (desc === "B" ||
            desc === "C" ||
            desc === "D" ||
            desc === "F" ||
            desc === "I" ||
            desc === "J" ||
            desc === "S" ||
            desc === "Z");
    }
    getSize() {
        switch (this.descriptor) {
            case "B":
            case "Z":
                return 1;
            case "C":
            case "S":
                return 2;
            case "I":
            case "F":
                return 4;
            case "J":
            case "D":
                return 8;
            default:
                return 4;
        }
    }
    getSignature() {
        return `${this.name}:${this.descriptor}`;
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
        return `${flags.join(" ")} ${this.name}: ${this.descriptor}`;
    }
}
exports.FieldInfo = FieldInfo;
function parseFields(reader, constantPool) {
    const count = reader.readU2();
    const fields = [];
    for (let i = 0; i < count; i++) {
        fields.push(new FieldInfo(reader, constantPool));
    }
    return fields;
}
exports.parseFields = parseFields;
//# sourceMappingURL=field-info.js.map