"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassInfo = void 0;
const constants_1 = require("../core/constants");
const utils_1 = require("../core/utils");
const reader_1 = require("./reader");
const constant_pool_1 = require("./constant-pool");
const field_info_1 = require("./field-info");
const method_info_1 = require("./method-info");
const attributes_1 = require("./attributes");
class ClassInfo {
    constructor(buffer) {
        this.id = ClassInfo.nextId++;
        const reader = new reader_1.ClassFileReader(buffer);
        const magic = reader.readU4();
        if (magic !== constants_1.CLASS_FILE_MAGIC) {
            throw new Error(`Invalid class file magic: 0x${magic.toString(16)} (expected 0x${constants_1.CLASS_FILE_MAGIC.toString(16)})`);
        }
        this.minorVersion = reader.readU2();
        this.majorVersion = reader.readU2();
        this.constantPool = new constant_pool_1.ConstantPool(reader);
        this.accessFlags = reader.readU2();
        const thisClassIndex = reader.readU2();
        this.thisClass = this.constantPool.getClassName(thisClassIndex);
        const superClassIndex = reader.readU2();
        this.superClass =
            superClassIndex === 0 ? null : this.constantPool.getClassName(superClassIndex);
        const interfaceCount = reader.readU2();
        this.interfaces = [];
        for (let i = 0; i < interfaceCount; i++) {
            const interfaceIndex = reader.readU2();
            this.interfaces.push(this.constantPool.getClassName(interfaceIndex));
        }
        this.fields = (0, field_info_1.parseFields)(reader, this.constantPool);
        this.methods = (0, method_info_1.parseMethods)(reader, this.constantPool);
        for (const method of this.methods) {
            method.classInfo = this;
        }
        const attrParser = new attributes_1.AttributeParser(reader, this.constantPool);
        this.attributes = attrParser.parseAttributes();
    }
    isPublic() {
        return (0, utils_1.isPublic)(this.accessFlags);
    }
    isFinal() {
        return (0, utils_1.isFinal)(this.accessFlags);
    }
    isAbstract() {
        return (0, utils_1.isAbstract)(this.accessFlags);
    }
    isInterface() {
        return (0, utils_1.isInterface)(this.accessFlags);
    }
    getField(name, descriptor) {
        return this.fields.find((field) => field.name === name && (descriptor === undefined || field.descriptor === descriptor));
    }
    getMethod(name, descriptor) {
        return this.methods.find((method) => method.name === name &&
            (descriptor === undefined || method.descriptor === descriptor));
    }
    getStaticFields() {
        return this.fields.filter((field) => field.isStatic());
    }
    getInstanceFields() {
        return this.fields.filter((field) => !field.isStatic());
    }
    getStaticMethods() {
        return this.methods.filter((method) => method.isStatic());
    }
    getInstanceMethods() {
        return this.methods.filter((method) => !method.isStatic());
    }
    getConstructors() {
        return this.methods.filter((method) => method.isConstructor());
    }
    getJavaVersion() {
        const versionMap = {
            45: "1.1",
            46: "1.2",
            47: "1.3",
            48: "1.4",
            49: "5.0",
            50: "6",
            51: "7",
            52: "8",
        };
        return versionMap[this.majorVersion] || `Unknown (${this.majorVersion})`;
    }
    getSimpleName() {
        const lastSlash = this.thisClass.lastIndexOf("/");
        return lastSlash === -1 ? this.thisClass : this.thisClass.substring(lastSlash + 1);
    }
    getPackageName() {
        const lastSlash = this.thisClass.lastIndexOf("/");
        return lastSlash === -1 ? "" : this.thisClass.substring(0, lastSlash).replace(/\//g, ".");
    }
    toString() {
        const flags = [];
        if (this.isPublic())
            flags.push("public");
        if (this.isFinal())
            flags.push("final");
        if (this.isAbstract())
            flags.push("abstract");
        const type = this.isInterface() ? "interface" : "class";
        const extendsClause = this.superClass ? ` extends ${this.superClass}` : "";
        const implementsClause = this.interfaces.length > 0 ? ` implements ${this.interfaces.join(", ")}` : "";
        return `${flags.join(" ")} ${type} ${this.thisClass}${extendsClause}${implementsClause}`;
    }
    printDetails() {
        const lines = [];
        lines.push(`Class: ${this.thisClass}`);
        lines.push(`  Version: ${this.getJavaVersion()} (${this.majorVersion}.${this.minorVersion})`);
        lines.push(`  Super: ${this.superClass || "none"}`);
        lines.push(`  Interfaces: ${this.interfaces.join(", ") || "none"}`);
        lines.push(`  Fields: ${this.fields.length}`);
        lines.push(`  Methods: ${this.methods.length}`);
        lines.push(`  Constant Pool: ${this.constantPool.getSize()} entries`);
        return lines.join("\n");
    }
}
exports.ClassInfo = ClassInfo;
ClassInfo.nextId = 0;
//# sourceMappingURL=class-info.js.map