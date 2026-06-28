"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComparisonInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class ComparisonInstructions {
    static lcmp(frame, thread) {
        const value2 = frame.stack.popLong();
        const value1 = frame.stack.popLong();
        if (value1 > value2) {
            frame.stack.push(1);
        }
        else if (value1 < value2) {
            frame.stack.push(-1);
        }
        else {
            frame.stack.push(0);
        }
        frame.pc++;
    }
    static fcmpl(frame, thread) {
        const value2 = frame.stack.pop();
        const value1 = frame.stack.pop();
        if (isNaN(value1) || isNaN(value2)) {
            frame.stack.push(-1);
        }
        else if (value1 > value2) {
            frame.stack.push(1);
        }
        else if (value1 < value2) {
            frame.stack.push(-1);
        }
        else {
            frame.stack.push(0);
        }
        frame.pc++;
    }
    static fcmpg(frame, thread) {
        const value2 = frame.stack.pop();
        const value1 = frame.stack.pop();
        if (isNaN(value1) || isNaN(value2)) {
            frame.stack.push(1);
        }
        else if (value1 > value2) {
            frame.stack.push(1);
        }
        else if (value1 < value2) {
            frame.stack.push(-1);
        }
        else {
            frame.stack.push(0);
        }
        frame.pc++;
    }
    static dcmpl(frame, thread) {
        const value2 = frame.stack.pop();
        const value1 = frame.stack.pop();
        if (isNaN(value1) || isNaN(value2)) {
            frame.stack.push(-1);
        }
        else if (value1 > value2) {
            frame.stack.push(1);
        }
        else if (value1 < value2) {
            frame.stack.push(-1);
        }
        else {
            frame.stack.push(0);
        }
        frame.pc++;
    }
    static dcmpg(frame, thread) {
        const value2 = frame.stack.pop();
        const value1 = frame.stack.pop();
        if (isNaN(value1) || isNaN(value2)) {
            frame.stack.push(1);
        }
        else if (value1 > value2) {
            frame.stack.push(1);
        }
        else if (value1 < value2) {
            frame.stack.push(-1);
        }
        else {
            frame.stack.push(0);
        }
        frame.pc++;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LCMP)
], ComparisonInstructions, "lcmp", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.FCMPL)
], ComparisonInstructions, "fcmpl", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.FCMPG)
], ComparisonInstructions, "fcmpg", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DCMPL)
], ComparisonInstructions, "dcmpl", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DCMPG)
], ComparisonInstructions, "dcmpg", null);
exports.ComparisonInstructions = ComparisonInstructions;
//# sourceMappingURL=comparison-instructions.js.map