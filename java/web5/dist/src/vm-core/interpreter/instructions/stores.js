"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class StoreInstructions {
    static istore(frame, thread) {
        const index = frame.method.getCode().code[frame.pc + 1];
        frame.setLocal(index, frame.stack.popInt());
        frame.pc += 2;
    }
    static istore_0(frame, thread) {
        frame.setLocal(0, frame.stack.popInt());
        frame.pc++;
    }
    static istore_1(frame, thread) {
        frame.setLocal(1, frame.stack.popInt());
        frame.pc++;
    }
    static istore_2(frame, thread) {
        frame.setLocal(2, frame.stack.popInt());
        frame.pc++;
    }
    static istore_3(frame, thread) {
        frame.setLocal(3, frame.stack.popInt());
        frame.pc++;
    }
    static lstore(frame, thread) {
        const index = frame.method.getCode().code[frame.pc + 1];
        frame.setLocal(index, frame.stack.popLong());
        frame.pc += 2;
    }
    static lstore_0(frame, thread) {
        frame.setLocal(0, frame.stack.popLong());
        frame.pc++;
    }
    static lstore_1(frame, thread) {
        frame.setLocal(1, frame.stack.popLong());
        frame.pc++;
    }
    static lstore_2(frame, thread) {
        frame.setLocal(2, frame.stack.popLong());
        frame.pc++;
    }
    static lstore_3(frame, thread) {
        frame.setLocal(3, frame.stack.popLong());
        frame.pc++;
    }
    static astore(frame, thread) {
        const index = frame.method.getCode().code[frame.pc + 1];
        frame.setLocal(index, frame.stack.popRef());
        frame.pc += 2;
    }
    static astore_0(frame, thread) {
        frame.setLocal(0, frame.stack.popRef());
        frame.pc++;
    }
    static astore_1(frame, thread) {
        frame.setLocal(1, frame.stack.popRef());
        frame.pc++;
    }
    static astore_2(frame, thread) {
        frame.setLocal(2, frame.stack.popRef());
        frame.pc++;
    }
    static astore_3(frame, thread) {
        frame.setLocal(3, frame.stack.popRef());
        frame.pc++;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ISTORE)
], StoreInstructions, "istore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ISTORE_0)
], StoreInstructions, "istore_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ISTORE_1)
], StoreInstructions, "istore_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ISTORE_2)
], StoreInstructions, "istore_2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ISTORE_3)
], StoreInstructions, "istore_3", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LSTORE)
], StoreInstructions, "lstore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LSTORE_0)
], StoreInstructions, "lstore_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LSTORE_1)
], StoreInstructions, "lstore_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LSTORE_2)
], StoreInstructions, "lstore_2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LSTORE_3)
], StoreInstructions, "lstore_3", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ASTORE)
], StoreInstructions, "astore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ASTORE_0)
], StoreInstructions, "astore_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ASTORE_1)
], StoreInstructions, "astore_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ASTORE_2)
], StoreInstructions, "astore_2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ASTORE_3)
], StoreInstructions, "astore_3", null);
exports.StoreInstructions = StoreInstructions;
//# sourceMappingURL=stores.js.map