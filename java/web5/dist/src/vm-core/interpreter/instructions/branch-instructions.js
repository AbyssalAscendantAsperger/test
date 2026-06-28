"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class BranchInstructions {
    static goto(frame, thread) {
        const code = frame.method.getCode();
        const branchbyte1 = code.code[frame.pc + 1];
        const branchbyte2 = code.code[frame.pc + 2];
        const offset = (branchbyte1 << 8) | branchbyte2;
        const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
        frame.pc += signedOffset;
    }
    static ifeq(frame, thread) {
        const value = frame.stack.popInt();
        if (value === 0) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static ifne(frame, thread) {
        const value = frame.stack.popInt();
        if (value !== 0) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static iflt(frame, thread) {
        const value = frame.stack.popInt();
        if (value < 0) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static ifge(frame, thread) {
        const value = frame.stack.popInt();
        if (value >= 0) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static ifgt(frame, thread) {
        const value = frame.stack.popInt();
        if (value > 0) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static ifle(frame, thread) {
        const value = frame.stack.popInt();
        if (value <= 0) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static if_icmpeq(frame, thread) {
        const value2 = frame.stack.popInt();
        const value1 = frame.stack.popInt();
        if (value1 === value2) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static if_icmpne(frame, thread) {
        const value2 = frame.stack.popInt();
        const value1 = frame.stack.popInt();
        if (value1 !== value2) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static if_icmplt(frame, thread) {
        const value2 = frame.stack.popInt();
        const value1 = frame.stack.popInt();
        if (value1 < value2) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static if_icmpge(frame, thread) {
        const value2 = frame.stack.popInt();
        const value1 = frame.stack.popInt();
        if (value1 >= value2) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static if_icmpgt(frame, thread) {
        const value2 = frame.stack.popInt();
        const value1 = frame.stack.popInt();
        if (value1 > value2) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static if_icmple(frame, thread) {
        const value2 = frame.stack.popInt();
        const value1 = frame.stack.popInt();
        if (value1 <= value2) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static if_acmpeq(frame, thread) {
        const value2 = frame.stack.pop();
        const value1 = frame.stack.pop();
        if (value1 === value2) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static if_acmpne(frame, thread) {
        const value2 = frame.stack.pop();
        const value1 = frame.stack.pop();
        if (value1 !== value2) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static ifnull(frame, thread) {
        const value = frame.stack.pop();
        if (value === null) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
    static ifnonnull(frame, thread) {
        const value = frame.stack.pop();
        if (value !== null) {
            const code = frame.method.getCode();
            const branchbyte1 = code.code[frame.pc + 1];
            const branchbyte2 = code.code[frame.pc + 2];
            const offset = (branchbyte1 << 8) | branchbyte2;
            const signedOffset = offset > 0x7fff ? offset - 0x10000 : offset;
            frame.pc += signedOffset;
        }
        else {
            frame.pc += 3;
        }
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.GOTO)
], BranchInstructions, "goto", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IFEQ)
], BranchInstructions, "ifeq", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IFNE)
], BranchInstructions, "ifne", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IFLT)
], BranchInstructions, "iflt", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IFGE)
], BranchInstructions, "ifge", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IFGT)
], BranchInstructions, "ifgt", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IFLE)
], BranchInstructions, "ifle", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IF_ICMPEQ)
], BranchInstructions, "if_icmpeq", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IF_ICMPNE)
], BranchInstructions, "if_icmpne", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IF_ICMPLT)
], BranchInstructions, "if_icmplt", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IF_ICMPGE)
], BranchInstructions, "if_icmpge", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IF_ICMPGT)
], BranchInstructions, "if_icmpgt", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IF_ICMPLE)
], BranchInstructions, "if_icmple", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IF_ACMPEQ)
], BranchInstructions, "if_acmpeq", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IF_ACMPNE)
], BranchInstructions, "if_acmpne", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IFNULL)
], BranchInstructions, "ifnull", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IFNONNULL)
], BranchInstructions, "ifnonnull", null);
exports.BranchInstructions = BranchInstructions;
//# sourceMappingURL=branch-instructions.js.map