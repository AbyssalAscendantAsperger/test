"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class MathInstructions {
    static iadd(frame, thread) {
        const v2 = frame.stack.popInt();
        const v1 = frame.stack.popInt();
        frame.stack.push((v1 + v2) | 0);
        frame.pc++;
    }
    static isub(frame, thread) {
        const v2 = frame.stack.popInt();
        const v1 = frame.stack.popInt();
        frame.stack.push((v1 - v2) | 0);
        frame.pc++;
    }
    static imul(frame, thread) {
        const v2 = frame.stack.popInt();
        const v1 = frame.stack.popInt();
        frame.stack.push(Math.imul(v1, v2));
        frame.pc++;
    }
    static idiv(frame, thread) {
        const v2 = frame.stack.popInt();
        const v1 = frame.stack.popInt();
        if (v2 === 0) {
            throw new Error("ArithmeticException: / by zero");
        }
        frame.stack.push((v1 / v2) | 0);
        frame.pc++;
    }
    static irem(frame, thread) {
        const v2 = frame.stack.popInt();
        const v1 = frame.stack.popInt();
        if (v2 === 0) {
            throw new Error("ArithmeticException: / by zero");
        }
        frame.stack.push((v1 % v2) | 0);
        frame.pc++;
    }
    static ineg(frame, thread) {
        const value = frame.stack.popInt();
        frame.stack.push((-value) | 0);
        frame.pc++;
    }
    static ishl(frame, thread) {
        const shift = frame.stack.popInt() & 0x1f;
        const value = frame.stack.popInt();
        frame.stack.push((value << shift) | 0);
        frame.pc++;
    }
    static ishr(frame, thread) {
        const shift = frame.stack.popInt() & 0x1f;
        const value = frame.stack.popInt();
        frame.stack.push((value >> shift) | 0);
        frame.pc++;
    }
    static iushr(frame, thread) {
        const shift = frame.stack.popInt() & 0x1f;
        const value = frame.stack.popInt();
        frame.stack.push((value >>> shift) | 0);
        frame.pc++;
    }
    static iand(frame, thread) {
        const v2 = frame.stack.popInt();
        const v1 = frame.stack.popInt();
        frame.stack.push((v1 & v2) | 0);
        frame.pc++;
    }
    static ior(frame, thread) {
        const v2 = frame.stack.popInt();
        const v1 = frame.stack.popInt();
        frame.stack.push((v1 | v2) | 0);
        frame.pc++;
    }
    static ixor(frame, thread) {
        const v2 = frame.stack.popInt();
        const v1 = frame.stack.popInt();
        frame.stack.push((v1 ^ v2) | 0);
        frame.pc++;
    }
    static ladd(frame, thread) {
        const v2 = frame.stack.popLong();
        const v1 = frame.stack.popLong();
        frame.stack.pushLong(v1 + v2);
        frame.pc++;
    }
    static lsub(frame, thread) {
        const v2 = frame.stack.popLong();
        const v1 = frame.stack.popLong();
        frame.stack.pushLong(v1 - v2);
        frame.pc++;
    }
    static lmul(frame, thread) {
        const v2 = frame.stack.popLong();
        const v1 = frame.stack.popLong();
        frame.stack.pushLong(v1 * v2);
        frame.pc++;
    }
    static ldiv(frame, thread) {
        const v2 = frame.stack.popLong();
        const v1 = frame.stack.popLong();
        if (v2 === 0n) {
            throw new Error("ArithmeticException: / by zero");
        }
        frame.stack.pushLong(v1 / v2);
        frame.pc++;
    }
    static lrem(frame, thread) {
        const v2 = frame.stack.popLong();
        const v1 = frame.stack.popLong();
        if (v2 === 0n) {
            throw new Error("ArithmeticException: / by zero");
        }
        frame.stack.pushLong(v1 % v2);
        frame.pc++;
    }
    static lneg(frame, thread) {
        const value = frame.stack.popLong();
        frame.stack.pushLong(-value);
        frame.pc++;
    }
    static lshl(frame, thread) {
        const shift = frame.stack.popInt() & 0x3f;
        const value = frame.stack.popLong();
        frame.stack.pushLong(value << BigInt(shift));
        frame.pc++;
    }
    static lshr(frame, thread) {
        const shift = frame.stack.popInt() & 0x3f;
        const value = frame.stack.popLong();
        frame.stack.pushLong(value >> BigInt(shift));
        frame.pc++;
    }
    static lushr(frame, thread) {
        const shift = frame.stack.popInt() & 0x3f;
        const value = frame.stack.popLong();
        const mask = shift === 0 ? value : value >> BigInt(shift);
        frame.stack.pushLong(mask);
        frame.pc++;
    }
    static land(frame, thread) {
        const v2 = frame.stack.popLong();
        const v1 = frame.stack.popLong();
        frame.stack.pushLong(v1 & v2);
        frame.pc++;
    }
    static lor(frame, thread) {
        const v2 = frame.stack.popLong();
        const v1 = frame.stack.popLong();
        frame.stack.pushLong(v1 | v2);
        frame.pc++;
    }
    static lxor(frame, thread) {
        const v2 = frame.stack.popLong();
        const v1 = frame.stack.popLong();
        frame.stack.pushLong(v1 ^ v2);
        frame.pc++;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IADD)
], MathInstructions, "iadd", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ISUB)
], MathInstructions, "isub", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IMUL)
], MathInstructions, "imul", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IDIV)
], MathInstructions, "idiv", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IREM)
], MathInstructions, "irem", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.INEG)
], MathInstructions, "ineg", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ISHL)
], MathInstructions, "ishl", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ISHR)
], MathInstructions, "ishr", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IUSHR)
], MathInstructions, "iushr", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IAND)
], MathInstructions, "iand", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IOR)
], MathInstructions, "ior", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IXOR)
], MathInstructions, "ixor", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LADD)
], MathInstructions, "ladd", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LSUB)
], MathInstructions, "lsub", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LMUL)
], MathInstructions, "lmul", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LDIV)
], MathInstructions, "ldiv", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LREM)
], MathInstructions, "lrem", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LNEG)
], MathInstructions, "lneg", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LSHL)
], MathInstructions, "lshl", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LSHR)
], MathInstructions, "lshr", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LUSHR)
], MathInstructions, "lushr", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LAND)
], MathInstructions, "land", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LOR)
], MathInstructions, "lor", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LXOR)
], MathInstructions, "lxor", null);
exports.MathInstructions = MathInstructions;
//# sourceMappingURL=math.js.map