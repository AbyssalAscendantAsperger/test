"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpcodeLength = exports.getOpcodeMnemonic = exports.OPCODE_DESCRIPTORS = exports.OpcodeFormat = exports.OpcodeFlags = void 0;
const opcodes_1 = require("./opcodes");
var OpcodeFlags;
(function (OpcodeFlags) {
    OpcodeFlags[OpcodeFlags["NONE"] = 0] = "NONE";
    OpcodeFlags[OpcodeFlags["STOP"] = 1] = "STOP";
    OpcodeFlags[OpcodeFlags["FALL_THROUGH"] = 2] = "FALL_THROUGH";
    OpcodeFlags[OpcodeFlags["BRANCH"] = 4] = "BRANCH";
    OpcodeFlags[OpcodeFlags["CONDITIONAL"] = 8] = "CONDITIONAL";
    OpcodeFlags[OpcodeFlags["UNCONDITIONAL"] = 16] = "UNCONDITIONAL";
    OpcodeFlags[OpcodeFlags["INVOKE"] = 32] = "INVOKE";
    OpcodeFlags[OpcodeFlags["TRAP"] = 64] = "TRAP";
    OpcodeFlags[OpcodeFlags["COMMUTATIVE"] = 128] = "COMMUTATIVE";
    OpcodeFlags[OpcodeFlags["ASSOCIATIVE"] = 256] = "ASSOCIATIVE";
})(OpcodeFlags = exports.OpcodeFlags || (exports.OpcodeFlags = {}));
var OpcodeFormat;
(function (OpcodeFormat) {
    OpcodeFormat[OpcodeFormat["NONE"] = 0] = "NONE";
    OpcodeFormat[OpcodeFormat["U1"] = 1] = "U1";
    OpcodeFormat[OpcodeFormat["U2"] = 2] = "U2";
    OpcodeFormat[OpcodeFormat["I1"] = 3] = "I1";
    OpcodeFormat[OpcodeFormat["I2"] = 4] = "I2";
    OpcodeFormat[OpcodeFormat["LOCAL"] = 5] = "LOCAL";
    OpcodeFormat[OpcodeFormat["CONST1"] = 6] = "CONST1";
    OpcodeFormat[OpcodeFormat["CONST2"] = 7] = "CONST2";
    OpcodeFormat[OpcodeFormat["TABLESWITCH"] = 8] = "TABLESWITCH";
    OpcodeFormat[OpcodeFormat["LOOKUPSWITCH"] = 9] = "LOOKUPSWITCH";
    OpcodeFormat[OpcodeFormat["WIDE"] = 10] = "WIDE";
})(OpcodeFormat = exports.OpcodeFormat || (exports.OpcodeFormat = {}));
exports.OPCODE_DESCRIPTORS = new Map([
    [
        opcodes_1.Opcode.NOP,
        {
            opcode: opcodes_1.Opcode.NOP,
            mnemonic: "nop",
            format: OpcodeFormat.NONE,
            flags: OpcodeFlags.FALL_THROUGH,
            stackEffect: 0,
        },
    ],
    [
        opcodes_1.Opcode.ICONST_0,
        {
            opcode: opcodes_1.Opcode.ICONST_0,
            mnemonic: "iconst_0",
            format: OpcodeFormat.NONE,
            flags: OpcodeFlags.FALL_THROUGH,
            stackEffect: 1,
        },
    ],
    [
        opcodes_1.Opcode.LADD,
        {
            opcode: opcodes_1.Opcode.LADD,
            mnemonic: "ladd",
            format: OpcodeFormat.NONE,
            flags: OpcodeFlags.FALL_THROUGH |
                OpcodeFlags.COMMUTATIVE |
                OpcodeFlags.ASSOCIATIVE,
            stackEffect: -2,
        },
    ],
    [
        opcodes_1.Opcode.INVOKEVIRTUAL,
        {
            opcode: opcodes_1.Opcode.INVOKEVIRTUAL,
            mnemonic: "invokevirtual",
            format: OpcodeFormat.CONST2,
            flags: OpcodeFlags.INVOKE | OpcodeFlags.TRAP,
            stackEffect: -1,
        },
    ],
    [
        opcodes_1.Opcode.NEW,
        {
            opcode: opcodes_1.Opcode.NEW,
            mnemonic: "new",
            format: OpcodeFormat.CONST2,
            flags: OpcodeFlags.FALL_THROUGH | OpcodeFlags.TRAP,
            stackEffect: 1,
        },
    ],
    [
        opcodes_1.Opcode.RETURN,
        {
            opcode: opcodes_1.Opcode.RETURN,
            mnemonic: "return",
            format: OpcodeFormat.NONE,
            flags: OpcodeFlags.STOP,
            stackEffect: 0,
        },
    ],
]);
function getOpcodeMnemonic(opcode) {
    const descriptor = exports.OPCODE_DESCRIPTORS.get(opcode);
    return descriptor?.mnemonic ?? `unknown_${opcode.toString(16)}`;
}
exports.getOpcodeMnemonic = getOpcodeMnemonic;
function getOpcodeLength(opcode) {
    const descriptor = exports.OPCODE_DESCRIPTORS.get(opcode);
    if (!descriptor)
        return 1;
    switch (descriptor.format) {
        case OpcodeFormat.NONE:
            return 1;
        case OpcodeFormat.U1:
        case OpcodeFormat.I1:
        case OpcodeFormat.LOCAL:
        case OpcodeFormat.CONST1:
            return 2;
        case OpcodeFormat.U2:
        case OpcodeFormat.I2:
        case OpcodeFormat.CONST2:
            return 3;
        case OpcodeFormat.TABLESWITCH:
        case OpcodeFormat.LOOKUPSWITCH:
        case OpcodeFormat.WIDE:
            return -1;
        default:
            return 1;
    }
}
exports.getOpcodeLength = getOpcodeLength;
//# sourceMappingURL=descriptors.js.map