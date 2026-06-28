"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
const object_1 = require("../../runtime/object");
const array_1 = require("../../runtime/array");
class TypeInstructions {
    static instanceof_check(frame, thread) {
        const code = frame.method.getCode();
        const indexbyte1 = code.code[frame.pc + 1];
        const indexbyte2 = code.code[frame.pc + 2];
        const index = (indexbyte1 << 8) | indexbyte2;
        const className = frame.method.classInfo.constantPool.getClassName(index);
        const objectref = frame.stack.pop();
        if (objectref === null) {
            frame.stack.push(0);
            frame.pc += 3;
            return;
        }
        const isInstance = TypeInstructions.isInstanceOf(objectref, className);
        frame.stack.push(isInstance ? 1 : 0);
        frame.pc += 3;
    }
    static checkcast(frame, thread) {
        const code = frame.method.getCode();
        const indexbyte1 = code.code[frame.pc + 1];
        const indexbyte2 = code.code[frame.pc + 2];
        const index = (indexbyte1 << 8) | indexbyte2;
        const className = frame.method.classInfo.constantPool.getClassName(index);
        const objectref = frame.stack.peek();
        if (objectref === null) {
            frame.pc += 3;
            return;
        }
        const isInstance = TypeInstructions.isInstanceOf(objectref, className);
        if (!isInstance) {
            throw new Error(`ClassCastException: Cannot cast to ${className}`);
        }
        frame.pc += 3;
    }
    static isInstanceOf(obj, targetClassName) {
        if (obj instanceof array_1.JavaArray) {
            const arrayClassName = obj.classInfo.thisClass;
            return TypeInstructions.isClassCompatible(arrayClassName, targetClassName);
        }
        if (obj instanceof object_1.JavaObject) {
            const objClassName = obj.classInfo.thisClass;
            return TypeInstructions.isClassCompatible(objClassName, targetClassName);
        }
        return false;
    }
    static isClassCompatible(sourceClass, targetClass) {
        if (sourceClass === targetClass) {
            return true;
        }
        if (sourceClass.startsWith('[') && targetClass.startsWith('[')) {
            const sourceDim = sourceClass.lastIndexOf('[') + 1;
            const targetDim = targetClass.lastIndexOf('[') + 1;
            if (sourceDim !== targetDim) {
                return false;
            }
            const sourceElement = sourceClass.substring(sourceDim);
            const targetElement = targetClass.substring(targetDim);
            if (sourceElement.length === 1 && targetElement.length === 1) {
                return sourceElement === targetElement;
            }
            if (sourceElement.startsWith('L') && targetElement.startsWith('L')) {
                const sourceType = sourceElement.substring(1, sourceElement.length - 1);
                const targetType = targetElement.substring(1, targetElement.length - 1);
                return TypeInstructions.isClassCompatible(sourceType, targetType);
            }
            return false;
        }
        if (targetClass === 'java/lang/Object') {
            return true;
        }
        return false;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.INSTANCEOF)
], TypeInstructions, "instanceof_check", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.CHECKCAST)
], TypeInstructions, "checkcast", null);
exports.TypeInstructions = TypeInstructions;
//# sourceMappingURL=type-instructions.js.map