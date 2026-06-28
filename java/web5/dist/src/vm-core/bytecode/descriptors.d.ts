import { Opcode } from "./opcodes";
export declare enum OpcodeFlags {
    NONE = 0,
    STOP = 1,
    FALL_THROUGH = 2,
    BRANCH = 4,
    CONDITIONAL = 8,
    UNCONDITIONAL = 16,
    INVOKE = 32,
    TRAP = 64,
    COMMUTATIVE = 128,
    ASSOCIATIVE = 256
}
export declare enum OpcodeFormat {
    NONE = 0,
    U1 = 1,
    U2 = 2,
    I1 = 3,
    I2 = 4,
    LOCAL = 5,
    CONST1 = 6,
    CONST2 = 7,
    TABLESWITCH = 8,
    LOOKUPSWITCH = 9,
    WIDE = 10
}
export interface OpcodeDescriptor {
    opcode: Opcode;
    mnemonic: string;
    format: OpcodeFormat;
    flags: OpcodeFlags;
    stackEffect: number;
}
export declare const OPCODE_DESCRIPTORS: Map<Opcode, OpcodeDescriptor>;
export declare function getOpcodeMnemonic(opcode: Opcode): string;
export declare function getOpcodeLength(opcode: Opcode): number;
