"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
const object_1 = require("../../runtime/object");
const constants_1 = require("../../core/constants");
class ConstantInstructions {
    static nop(frame, thread) {
        frame.pc++;
    }
    static new(frame, thread) {
        const code = frame.method.getCode();
        const index = (code.code[frame.pc + 1] << 8) | code.code[frame.pc + 2];
        const className = frame.method.classInfo.constantPool.getClassName(index);
        const classLoader = thread.classLoader;
        if (!classLoader) {
            throw new Error("ClassLoader not available in thread");
        }
        const classInfo = classLoader.loadClass(className);
        const object = new object_1.JavaObject(classInfo);
        frame.stack.push(object);
        frame.pc += 3;
    }
    static iconst_m1(frame, thread) {
        frame.stack.push(-1);
        frame.pc++;
    }
    static iconst_0(frame, thread) {
        frame.stack.push(0);
        frame.pc++;
    }
    static iconst_1(frame, thread) {
        frame.stack.push(1);
        frame.pc++;
    }
    static iconst_2(frame, thread) {
        frame.stack.push(2);
        frame.pc++;
    }
    static iconst_3(frame, thread) {
        frame.stack.push(3);
        frame.pc++;
    }
    static iconst_4(frame, thread) {
        frame.stack.push(4);
        frame.pc++;
    }
    static iconst_5(frame, thread) {
        frame.stack.push(5);
        frame.pc++;
    }
    static lconst_0(frame, thread) {
        frame.stack.push(0n);
        frame.pc++;
    }
    static lconst_1(frame, thread) {
        frame.stack.push(1n);
        frame.pc++;
    }
    static fconst_0(frame, thread) {
        frame.stack.push(0.0);
        frame.pc++;
    }
    static fconst_1(frame, thread) {
        frame.stack.push(1.0);
        frame.pc++;
    }
    static fconst_2(frame, thread) {
        frame.stack.push(2.0);
        frame.pc++;
    }
    static dconst_0(frame, thread) {
        frame.stack.push(0.0);
        frame.pc++;
    }
    static dconst_1(frame, thread) {
        frame.stack.push(1.0);
        frame.pc++;
    }
    static bipush(frame, thread) {
        const byte = frame.method.getCode().code[frame.pc + 1];
        const value = (byte << 24) >> 24;
        frame.stack.push(value);
        frame.pc += 2;
    }
    static sipush(frame, thread) {
        const code = frame.method.getCode().code;
        const b1 = code[frame.pc + 1];
        const b2 = code[frame.pc + 2];
        const shortVal = (b1 << 8) | b2;
        const value = (shortVal << 16) >> 16;
        frame.stack.push(value);
        frame.pc += 3;
    }
    static ldc(frame, thread) {
        const code = frame.method.getCode().code;
        const index = code[frame.pc + 1];
        ConstantInstructions.pushConstant(frame, index);
        frame.pc += 2;
    }
    static ldc_w(frame, thread) {
        const code = frame.method.getCode().code;
        const b1 = code[frame.pc + 1];
        const b2 = code[frame.pc + 2];
        const index = (b1 << 8) | b2;
        ConstantInstructions.pushConstant(frame, index);
        frame.pc += 3;
    }
    static ldc2_w(frame, thread) {
        const code = frame.method.getCode().code;
        const b1 = code[frame.pc + 1];
        const b2 = code[frame.pc + 2];
        const index = (b1 << 8) | b2;
        ConstantInstructions.pushConstant(frame, index);
        frame.pc += 3;
    }
    static pushConstant(frame, index) {
        const cp = frame.method.classInfo.constantPool;
        const entry = cp.get(index);
        if (entry.tag === constants_1.ConstantTag.Integer || entry.tag === constants_1.ConstantTag.Float || entry.tag === constants_1.ConstantTag.Long || entry.tag === constants_1.ConstantTag.Double) {
            frame.stack.push(entry.value);
        }
        else if (entry.tag === constants_1.ConstantTag.String) {
            frame.stack.push(cp.getString(index));
        }
        else if (entry.tag === constants_1.ConstantTag.Class) {
            frame.stack.push(cp.getClassName(index));
        }
        else {
            throw new Error(`Unsupported LDC constant pool tag: ${entry.tag}`);
        }
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.NOP)
], ConstantInstructions, "nop", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.NEW)
], ConstantInstructions, "new", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ICONST_M1)
], ConstantInstructions, "iconst_m1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ICONST_0)
], ConstantInstructions, "iconst_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ICONST_1)
], ConstantInstructions, "iconst_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ICONST_2)
], ConstantInstructions, "iconst_2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ICONST_3)
], ConstantInstructions, "iconst_3", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ICONST_4)
], ConstantInstructions, "iconst_4", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ICONST_5)
], ConstantInstructions, "iconst_5", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LCONST_0)
], ConstantInstructions, "lconst_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LCONST_1)
], ConstantInstructions, "lconst_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.FCONST_0)
], ConstantInstructions, "fconst_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.FCONST_1)
], ConstantInstructions, "fconst_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.FCONST_2)
], ConstantInstructions, "fconst_2", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DCONST_0)
], ConstantInstructions, "dconst_0", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DCONST_1)
], ConstantInstructions, "dconst_1", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.BIPUSH)
], ConstantInstructions, "bipush", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.SIPUSH)
], ConstantInstructions, "sipush", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LDC)
], ConstantInstructions, "ldc", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LDC_W)
], ConstantInstructions, "ldc_w", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LDC2_W)
], ConstantInstructions, "ldc2_w", null);
exports.ConstantInstructions = ConstantInstructions;
//# sourceMappingURL=constants.js.map