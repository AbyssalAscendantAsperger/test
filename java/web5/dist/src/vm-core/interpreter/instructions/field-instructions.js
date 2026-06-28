"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
const object_1 = require("../../runtime/object");
class FieldInstructions {
    static getstatic(frame, thread) {
        const code = frame.method.getCode();
        const indexbyte1 = code.code[frame.pc + 1];
        const indexbyte2 = code.code[frame.pc + 2];
        const index = (indexbyte1 << 8) | indexbyte2;
        const fieldRef = frame.method.classInfo.constantPool.getFieldRef(index);
        const classStaticFields = FieldInstructions.getClassStaticFields(fieldRef.className);
        const fieldKey = `${fieldRef.fieldName}:${fieldRef.descriptor}`;
        let value = classStaticFields.get(fieldKey);
        if (value === undefined) {
            value = FieldInstructions.getDefaultValue(fieldRef.descriptor);
            classStaticFields.set(fieldKey, value);
        }
        frame.stack.push(value);
        frame.pc += 3;
    }
    static putstatic(frame, thread) {
        const code = frame.method.getCode();
        const indexbyte1 = code.code[frame.pc + 1];
        const indexbyte2 = code.code[frame.pc + 2];
        const index = (indexbyte1 << 8) | indexbyte2;
        const fieldRef = frame.method.classInfo.constantPool.getFieldRef(index);
        const value = frame.stack.pop();
        const classStaticFields = FieldInstructions.getClassStaticFields(fieldRef.className);
        const fieldKey = `${fieldRef.fieldName}:${fieldRef.descriptor}`;
        classStaticFields.set(fieldKey, value);
        frame.pc += 3;
    }
    static getfield(frame, thread) {
        const code = frame.method.getCode();
        const indexbyte1 = code.code[frame.pc + 1];
        const indexbyte2 = code.code[frame.pc + 2];
        const index = (indexbyte1 << 8) | indexbyte2;
        const fieldRef = frame.method.classInfo.constantPool.getFieldRef(index);
        const object = frame.stack.pop();
        if (object === null) {
            throw new Error(`NullPointerException: Cannot access field ${fieldRef.fieldName} on null object`);
        }
        if (!(object instanceof object_1.JavaObject)) {
            throw new Error(`Invalid object type for getfield: ${typeof object}`);
        }
        const value = object.getField(fieldRef.fieldName, fieldRef.descriptor);
        frame.stack.push(value);
        frame.pc += 3;
    }
    static putfield(frame, thread) {
        const code = frame.method.getCode();
        const indexbyte1 = code.code[frame.pc + 1];
        const indexbyte2 = code.code[frame.pc + 2];
        const index = (indexbyte1 << 8) | indexbyte2;
        const fieldRef = frame.method.classInfo.constantPool.getFieldRef(index);
        const value = frame.stack.pop();
        const object = frame.stack.pop();
        if (object === null) {
            throw new Error(`NullPointerException: Cannot access field ${fieldRef.fieldName} on null object`);
        }
        if (!(object instanceof object_1.JavaObject)) {
            throw new Error(`Invalid object type for putfield: ${typeof object}`);
        }
        object.setField(fieldRef.fieldName, fieldRef.descriptor, value);
        frame.pc += 3;
    }
    static getClassStaticFields(className) {
        if (!FieldInstructions.staticFieldCache.has(className)) {
            FieldInstructions.staticFieldCache.set(className, new Map());
        }
        return FieldInstructions.staticFieldCache.get(className);
    }
    static getDefaultValue(descriptor) {
        switch (descriptor) {
            case 'Z':
            case 'B':
            case 'C':
            case 'S':
            case 'I':
                return 0;
            case 'J':
                return 0n;
            case 'F':
            case 'D':
                return 0.0;
            default:
                return null;
        }
    }
}
FieldInstructions.staticFieldCache = new Map();
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.GETSTATIC)
], FieldInstructions, "getstatic", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.PUTSTATIC)
], FieldInstructions, "putstatic", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.GETFIELD)
], FieldInstructions, "getfield", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.PUTFIELD)
], FieldInstructions, "putfield", null);
exports.FieldInstructions = FieldInstructions;
//# sourceMappingURL=field-instructions.js.map