"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class LoadInstructions {
    static iload(frame, thread) {
        const index = frame.method.getCode().code[frame.pc + 1];
        frame.stack.push(frame.getInt(index));
        frame.pc += 2;
    }
    static iload_0(frame, thread) {
        frame.stack.push(frame.getInt(0));
        frame.pc++;
    }
    static iload_1(frame, thread) {
        frame.stack.push(frame.getInt(1));
        frame.pc++;
    }
    static iload_2(frame, thread) {
        frame.stack.push(frame.getInt(2));
        frame.pc++;
    }
    static iload_3(frame, thread) {
        frame.stack.push(frame.getInt(3));
        frame.pc++;
    }
    static lload(frame, thread) {
        const index = frame.method.getCode().code[frame.pc + 1];
        frame.stack.push(frame.getLong(index));
        frame.pc += 2;
    }
    static lload_0(frame, thread) {
        frame.stack.push(frame.getLong(0));
        frame.pc++;
    }
    static lload_1(frame, thread) {
        frame.stack.push(frame.getLong(1));
        frame.pc++;
    }
    static lload_2(frame, thread) {
        frame.stack.push(frame.getLong(2));
        frame.pc++;
    }
    static lload_3(frame, thread) {
        frame.stack.push(frame.getLong(3));
        frame.pc++;
    }
    static aload(frame, thread) {
        const index = frame.method.getCode().code[frame.pc + 1];
        frame.stack.push(frame.getLocal(index));
        frame.pc += 2;
    }
    static aload_0(frame, thread) {
        frame.stack.push(frame.getLocal(0));
        frame.pc++;
    }
    static aload_1(frame, thread) {
        frame.stack.push(frame.getLocal(1));
        frame.pc++;
    }
    static aload_2(frame, thread) {
        frame.stack.push(frame.getLocal(2));
        frame.pc++;
    }
    static aload_3(frame, thread) {
        frame.stack.push(frame.getLocal(3));
        frame.pc++;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ILOAD)
], LoadInstructions, "iload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ILOAD_0)
], LoadInstructions, "iload_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ILOAD_1)
], LoadInstructions, "iload_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ILOAD_2)
], LoadInstructions, "iload_2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ILOAD_3)
], LoadInstructions, "iload_3", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LLOAD)
], LoadInstructions, "lload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LLOAD_0)
], LoadInstructions, "lload_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LLOAD_1)
], LoadInstructions, "lload_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LLOAD_2)
], LoadInstructions, "lload_2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LLOAD_3)
], LoadInstructions, "lload_3", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ALOAD)
], LoadInstructions, "aload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ALOAD_0)
], LoadInstructions, "aload_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ALOAD_1)
], LoadInstructions, "aload_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ALOAD_2)
], LoadInstructions, "aload_2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ALOAD_3)
], LoadInstructions, "aload_3", null);
exports.LoadInstructions = LoadInstructions;
//# sourceMappingURL=loads.js.map