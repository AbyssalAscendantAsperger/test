"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionStatus = exports.PRIMITIVE_SIZE = exports.PrimitiveType = exports.AccessFlags = exports.CONSTANT_TAG_SIZE = exports.ConstantTag = exports.CLASS_FILE_MAGIC = void 0;
exports.CLASS_FILE_MAGIC = 0xcafebabe;
var ConstantTag;
(function (ConstantTag) {
    ConstantTag[ConstantTag["Utf8"] = 1] = "Utf8";
    ConstantTag[ConstantTag["Integer"] = 3] = "Integer";
    ConstantTag[ConstantTag["Float"] = 4] = "Float";
    ConstantTag[ConstantTag["Long"] = 5] = "Long";
    ConstantTag[ConstantTag["Double"] = 6] = "Double";
    ConstantTag[ConstantTag["Class"] = 7] = "Class";
    ConstantTag[ConstantTag["String"] = 8] = "String";
    ConstantTag[ConstantTag["Fieldref"] = 9] = "Fieldref";
    ConstantTag[ConstantTag["Methodref"] = 10] = "Methodref";
    ConstantTag[ConstantTag["InterfaceMethodref"] = 11] = "InterfaceMethodref";
    ConstantTag[ConstantTag["NameAndType"] = 12] = "NameAndType";
})(ConstantTag = exports.ConstantTag || (exports.ConstantTag = {}));
exports.CONSTANT_TAG_SIZE = {
    [ConstantTag.Integer]: 4,
    [ConstantTag.Float]: 4,
    [ConstantTag.Long]: 8,
    [ConstantTag.Double]: 8,
    [ConstantTag.Class]: 2,
    [ConstantTag.String]: 2,
    [ConstantTag.Fieldref]: 4,
    [ConstantTag.Methodref]: 4,
    [ConstantTag.InterfaceMethodref]: 4,
    [ConstantTag.NameAndType]: 4,
};
var AccessFlags;
(function (AccessFlags) {
    AccessFlags[AccessFlags["PUBLIC"] = 1] = "PUBLIC";
    AccessFlags[AccessFlags["PRIVATE"] = 2] = "PRIVATE";
    AccessFlags[AccessFlags["PROTECTED"] = 4] = "PROTECTED";
    AccessFlags[AccessFlags["STATIC"] = 8] = "STATIC";
    AccessFlags[AccessFlags["FINAL"] = 16] = "FINAL";
    AccessFlags[AccessFlags["SYNCHRONIZED"] = 32] = "SYNCHRONIZED";
    AccessFlags[AccessFlags["VOLATILE"] = 64] = "VOLATILE";
    AccessFlags[AccessFlags["TRANSIENT"] = 128] = "TRANSIENT";
    AccessFlags[AccessFlags["NATIVE"] = 256] = "NATIVE";
    AccessFlags[AccessFlags["INTERFACE"] = 512] = "INTERFACE";
    AccessFlags[AccessFlags["ABSTRACT"] = 1024] = "ABSTRACT";
    AccessFlags[AccessFlags["STRICT"] = 2048] = "STRICT";
})(AccessFlags = exports.AccessFlags || (exports.AccessFlags = {}));
var PrimitiveType;
(function (PrimitiveType) {
    PrimitiveType["BYTE"] = "B";
    PrimitiveType["CHAR"] = "C";
    PrimitiveType["DOUBLE"] = "D";
    PrimitiveType["FLOAT"] = "F";
    PrimitiveType["INT"] = "I";
    PrimitiveType["LONG"] = "J";
    PrimitiveType["SHORT"] = "S";
    PrimitiveType["BOOLEAN"] = "Z";
    PrimitiveType["VOID"] = "V";
})(PrimitiveType = exports.PrimitiveType || (exports.PrimitiveType = {}));
exports.PRIMITIVE_SIZE = {
    B: 1,
    C: 2,
    D: 8,
    F: 4,
    I: 4,
    J: 8,
    S: 2,
    Z: 1,
};
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus[ExecutionStatus["RUNNING"] = 0] = "RUNNING";
    ExecutionStatus[ExecutionStatus["PAUSED"] = 1] = "PAUSED";
    ExecutionStatus[ExecutionStatus["BLOCKED"] = 2] = "BLOCKED";
    ExecutionStatus[ExecutionStatus["WAITING"] = 3] = "WAITING";
    ExecutionStatus[ExecutionStatus["TIMED_WAITING"] = 4] = "TIMED_WAITING";
    ExecutionStatus[ExecutionStatus["TERMINATED"] = 5] = "TERMINATED";
})(ExecutionStatus = exports.ExecutionStatus || (exports.ExecutionStatus = {}));
//# sourceMappingURL=constants.js.map