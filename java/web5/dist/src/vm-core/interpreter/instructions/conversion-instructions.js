"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversionInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class ConversionInstructions {
    static i2l(frame, thread) {
        const value = frame.stack.popInt();
        frame.stack.pushLong(BigInt(value));
        frame.pc++;
    }
    static i2f(frame, thread) {
        const value = frame.stack.popInt();
        frame.stack.push(value);
        frame.pc++;
    }
    static i2d(frame, thread) {
        const value = frame.stack.popInt();
        frame.stack.push(value);
        frame.pc++;
    }
    static l2i(frame, thread) {
        const value = frame.stack.popLong();
        frame.stack.push(Number(BigInt.asIntN(32, value)));
        frame.pc++;
    }
    static l2f(frame, thread) {
        const value = frame.stack.popLong();
        frame.stack.push(Number(value));
        frame.pc++;
    }
    static l2d(frame, thread) {
        const value = frame.stack.popLong();
        frame.stack.push(Number(value));
        frame.pc++;
    }
    static f2i(frame, thread) {
        const value = frame.stack.pop();
        const intValue = value >= 0 ? Math.floor(value) : Math.ceil(value);
        frame.stack.push(intValue | 0);
        frame.pc++;
    }
    static f2l(frame, thread) {
        const value = frame.stack.pop();
        const intValue = value >= 0 ? Math.floor(value) : Math.ceil(value);
        frame.stack.pushLong(BigInt(intValue));
        frame.pc++;
    }
    static f2d(frame, thread) {
        const value = frame.stack.pop();
        frame.stack.push(value);
        frame.pc++;
    }
    static d2i(frame, thread) {
        const value = frame.stack.pop();
        const intValue = value >= 0 ? Math.floor(value) : Math.ceil(value);
        frame.stack.push(intValue | 0);
        frame.pc++;
    }
    static d2l(frame, thread) {
        const value = frame.stack.pop();
        const intValue = value >= 0 ? Math.floor(value) : Math.ceil(value);
        frame.stack.pushLong(BigInt(intValue));
        frame.pc++;
    }
    static d2f(frame, thread) {
        const value = frame.stack.pop();
        frame.stack.push(value);
        frame.pc++;
    }
    static i2b(frame, thread) {
        const value = frame.stack.popInt();
        const byteValue = (value << 24) >> 24;
        frame.stack.push(byteValue);
        frame.pc++;
    }
    static i2c(frame, thread) {
        const value = frame.stack.popInt();
        const charValue = value & 0xFFFF;
        frame.stack.push(charValue);
        frame.pc++;
    }
    static i2s(frame, thread) {
        const value = frame.stack.popInt();
        const shortValue = (value << 16) >> 16;
        frame.stack.push(shortValue);
        frame.pc++;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.I2L)
], ConversionInstructions, "i2l", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.I2F)
], ConversionInstructions, "i2f", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.I2D)
], ConversionInstructions, "i2d", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.L2I)
], ConversionInstructions, "l2i", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.L2F)
], ConversionInstructions, "l2f", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.L2D)
], ConversionInstructions, "l2d", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.F2I)
], ConversionInstructions, "f2i", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.F2L)
], ConversionInstructions, "f2l", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.F2D)
], ConversionInstructions, "f2d", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.D2I)
], ConversionInstructions, "d2i", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.D2L)
], ConversionInstructions, "d2l", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.D2F)
], ConversionInstructions, "d2f", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.I2B)
], ConversionInstructions, "i2b", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.I2C)
], ConversionInstructions, "i2c", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.I2S)
], ConversionInstructions, "i2s", null);
exports.ConversionInstructions = ConversionInstructions;
//# sourceMappingURL=conversion-instructions.js.map