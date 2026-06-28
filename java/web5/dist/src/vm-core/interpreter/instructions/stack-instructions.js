"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class StackInstructions {
    static pop(frame, thread) {
        frame.stack.pop();
        frame.pc++;
    }
    static pop2(frame, thread) {
        frame.stack.pop();
        frame.stack.pop();
        frame.pc++;
    }
    static dup(frame, thread) {
        const value = frame.stack.peek();
        frame.stack.push(value);
        frame.pc++;
    }
    static dup_x1(frame, thread) {
        const value1 = frame.stack.pop();
        const value2 = frame.stack.pop();
        frame.stack.push(value1);
        frame.stack.push(value2);
        frame.stack.push(value1);
        frame.pc++;
    }
    static dup_x2(frame, thread) {
        const value1 = frame.stack.pop();
        const value2 = frame.stack.pop();
        const value3 = frame.stack.pop();
        frame.stack.push(value1);
        frame.stack.push(value3);
        frame.stack.push(value2);
        frame.stack.push(value1);
        frame.pc++;
    }
    static dup2(frame, thread) {
        const value1 = frame.stack.pop();
        const value2 = frame.stack.pop();
        frame.stack.push(value2);
        frame.stack.push(value1);
        frame.stack.push(value2);
        frame.stack.push(value1);
        frame.pc++;
    }
    static dup2_x1(frame, thread) {
        const value1 = frame.stack.pop();
        const value2 = frame.stack.pop();
        const value3 = frame.stack.pop();
        frame.stack.push(value2);
        frame.stack.push(value1);
        frame.stack.push(value3);
        frame.stack.push(value2);
        frame.stack.push(value1);
        frame.pc++;
    }
    static dup2_x2(frame, thread) {
        const value1 = frame.stack.pop();
        const value2 = frame.stack.pop();
        const value3 = frame.stack.pop();
        const value4 = frame.stack.pop();
        frame.stack.push(value2);
        frame.stack.push(value1);
        frame.stack.push(value4);
        frame.stack.push(value3);
        frame.stack.push(value2);
        frame.stack.push(value1);
        frame.pc++;
    }
    static swap(frame, thread) {
        const value1 = frame.stack.pop();
        const value2 = frame.stack.pop();
        frame.stack.push(value1);
        frame.stack.push(value2);
        frame.pc++;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.POP)
], StackInstructions, "pop", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.POP2)
], StackInstructions, "pop2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DUP)
], StackInstructions, "dup", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DUP_X1)
], StackInstructions, "dup_x1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DUP_X2)
], StackInstructions, "dup_x2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DUP2)
], StackInstructions, "dup2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DUP2_X1)
], StackInstructions, "dup2_x1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DUP2_X2)
], StackInstructions, "dup2_x2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.SWAP)
], StackInstructions, "swap", null);
exports.StackInstructions = StackInstructions;
//# sourceMappingURL=stack-instructions.js.map