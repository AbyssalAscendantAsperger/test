"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class ControlInstructions {
    static return_void(frame, thread) {
        thread.popFrame();
    }
    static ireturn(frame, thread) {
        const value = frame.stack.pop();
        thread.popFrame();
        if (thread.hasFrames()) {
            const invoker = thread.currentFrame();
            invoker.stack.push(value);
        }
    }
    static lreturn(frame, thread) {
        const value = frame.stack.pop();
        thread.popFrame();
        if (thread.hasFrames()) {
            const invoker = thread.currentFrame();
            invoker.stack.push(value);
        }
    }
    static freturn(frame, thread) {
        const value = frame.stack.pop();
        thread.popFrame();
        if (thread.hasFrames()) {
            const invoker = thread.currentFrame();
            invoker.stack.push(value);
        }
    }
    static dreturn(frame, thread) {
        const value = frame.stack.pop();
        thread.popFrame();
        if (thread.hasFrames()) {
            const invoker = thread.currentFrame();
            invoker.stack.push(value);
        }
    }
    static areturn(frame, thread) {
        const value = frame.stack.pop();
        thread.popFrame();
        if (thread.hasFrames()) {
            const invoker = thread.currentFrame();
            invoker.stack.push(value);
        }
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.RETURN)
], ControlInstructions, "return_void", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IRETURN)
], ControlInstructions, "ireturn", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LRETURN)
], ControlInstructions, "lreturn", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.FRETURN)
], ControlInstructions, "freturn", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DRETURN)
], ControlInstructions, "dreturn", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ARETURN)
], ControlInstructions, "areturn", null);
exports.ControlInstructions = ControlInstructions;
//# sourceMappingURL=control.js.map