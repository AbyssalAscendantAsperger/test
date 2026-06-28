"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
const array_1 = require("../../runtime/array");
const class_loader_1 = require("../../classfile/class-loader");
class ArrayInstructions {
    static newarray(frame, thread) {
        const atype = frame.method.getCode().code[frame.pc + 1];
        const count = frame.stack.popInt();
        if (count < 0) {
            throw new Error("NegativeArraySizeException");
        }
        let componentType;
        switch (atype) {
            case 4:
                componentType = array_1.ArrayType.BOOLEAN;
                break;
            case 5:
                componentType = array_1.ArrayType.CHAR;
                break;
            case 6:
                componentType = array_1.ArrayType.FLOAT;
                break;
            case 7:
                componentType = array_1.ArrayType.DOUBLE;
                break;
            case 8:
                componentType = array_1.ArrayType.BYTE;
                break;
            case 9:
                componentType = array_1.ArrayType.SHORT;
                break;
            case 10:
                componentType = array_1.ArrayType.INT;
                break;
            case 11:
                componentType = array_1.ArrayType.LONG;
                break;
            default:
                throw new Error(`Invalid array type: ${atype}`);
        }
        const classLoader = frame.method.classInfo.classLoader || new class_loader_1.ClassLoader({ readClass: () => null });
        const arrayClass = classLoader.loadClass(ArrayInstructions.getArrayClassName(componentType));
        const array = new array_1.JavaArray(arrayClass, componentType, count);
        frame.stack.push(array);
        frame.pc += 2;
    }
    static anewarray(frame, thread) {
        const code = frame.method.getCode();
        const indexbyte1 = code.code[frame.pc + 1];
        const indexbyte2 = code.code[frame.pc + 2];
        const index = (indexbyte1 << 8) | indexbyte2;
        const count = frame.stack.popInt();
        if (count < 0) {
            throw new Error("NegativeArraySizeException");
        }
        const componentClassName = frame.method.classInfo.constantPool.getClassName(index);
        const classLoader = frame.method.classInfo.classLoader || new class_loader_1.ClassLoader({ readClass: () => null });
        const arrayClassName = ArrayInstructions.getObjectArrayClassName(componentClassName);
        const arrayClass = classLoader.loadClass(arrayClassName);
        const array = new array_1.JavaArray(arrayClass, array_1.ArrayType.OBJECT, count);
        frame.stack.push(array);
        frame.pc += 3;
    }
    static arraylength(frame, thread) {
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        frame.stack.push(arrayref.length);
        frame.pc++;
    }
    static aaload(frame, thread) {
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        frame.stack.push(arrayref.getElement(index));
        frame.pc++;
    }
    static aastore(frame, thread) {
        const value = frame.stack.pop();
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        arrayref.setElement(index, value);
        frame.pc++;
    }
    static baload(frame, thread) {
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        const value = arrayref.getElement(index) & 0xFF;
        frame.stack.push((value << 24) >> 24);
        frame.pc++;
    }
    static bastore(frame, thread) {
        const value = frame.stack.popInt();
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        arrayref.setElement(index, value & 0xFF);
        frame.pc++;
    }
    static caload(frame, thread) {
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        frame.stack.push(arrayref.getElement(index) & 0xFFFF);
        frame.pc++;
    }
    static castore(frame, thread) {
        const value = frame.stack.popInt();
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        arrayref.setElement(index, value & 0xFFFF);
        frame.pc++;
    }
    static saload(frame, thread) {
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        const value = arrayref.getElement(index) & 0xFFFF;
        frame.stack.push((value << 16) >> 16);
        frame.pc++;
    }
    static sastore(frame, thread) {
        const value = frame.stack.popInt();
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        arrayref.setElement(index, value & 0xFFFF);
        frame.pc++;
    }
    static iaload(frame, thread) {
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        frame.stack.push(arrayref.getElement(index));
        frame.pc++;
    }
    static iastore(frame, thread) {
        const value = frame.stack.popInt();
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        arrayref.setElement(index, value);
        frame.pc++;
    }
    static laload(frame, thread) {
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        frame.stack.push(arrayref.getElement(index));
        frame.pc++;
    }
    static lastore(frame, thread) {
        const value = frame.stack.pop();
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        arrayref.setElement(index, value);
        frame.pc++;
    }
    static faload(frame, thread) {
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        frame.stack.push(arrayref.getElement(index));
        frame.pc++;
    }
    static fastore(frame, thread) {
        const value = frame.stack.pop();
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        arrayref.setElement(index, value);
        frame.pc++;
    }
    static daload(frame, thread) {
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        frame.stack.push(arrayref.getElement(index));
        frame.pc++;
    }
    static dastore(frame, thread) {
        const value = frame.stack.pop();
        const index = frame.stack.popInt();
        const arrayref = frame.stack.pop();
        if (arrayref === null) {
            throw new Error("NullPointerException");
        }
        if (!(arrayref instanceof array_1.JavaArray)) {
            throw new Error("Invalid array reference");
        }
        arrayref.setElement(index, value);
        frame.pc++;
    }
    static multianewarray(frame, thread) {
        const code = frame.method.getCode().code;
        const index = (code[frame.pc + 1] << 8) | code[frame.pc + 2];
        const dimensions = code[frame.pc + 3];
        const counts = [];
        for (let i = 0; i < dimensions; i++) {
            counts.unshift(frame.stack.popInt());
        }
        const className = frame.method.classInfo.constantPool.getClassName(index);
        const classLoader = frame.method.classInfo.classLoader || new class_loader_1.ClassLoader({ readClass: () => null });
        const array = ArrayInstructions.createMultiArray(classLoader, className, counts, 0);
        frame.stack.push(array);
        frame.pc += 4;
    }
    static createMultiArray(classLoader, arrayClassName, counts, dimIndex) {
        const count = counts[dimIndex];
        if (count < 0) {
            throw new Error("NegativeArraySizeException");
        }
        const isLastDim = dimIndex === counts.length - 1;
        const arrayClass = classLoader.loadClass(arrayClassName);
        if (isLastDim) {
            const componentTypeChar = arrayClassName.charAt(arrayClassName.lastIndexOf('[') + 1);
            let componentType;
            switch (componentTypeChar) {
                case 'Z':
                    componentType = array_1.ArrayType.BOOLEAN;
                    break;
                case 'B':
                    componentType = array_1.ArrayType.BYTE;
                    break;
                case 'C':
                    componentType = array_1.ArrayType.CHAR;
                    break;
                case 'S':
                    componentType = array_1.ArrayType.SHORT;
                    break;
                case 'I':
                    componentType = array_1.ArrayType.INT;
                    break;
                case 'J':
                    componentType = array_1.ArrayType.LONG;
                    break;
                case 'F':
                    componentType = array_1.ArrayType.FLOAT;
                    break;
                case 'D':
                    componentType = array_1.ArrayType.DOUBLE;
                    break;
                default:
                    componentType = array_1.ArrayType.OBJECT;
                    break;
            }
            return new array_1.JavaArray(arrayClass, componentType, count);
        }
        else {
            const array = new array_1.JavaArray(arrayClass, array_1.ArrayType.OBJECT, count);
            const nextArrayClassName = arrayClassName.substring(1);
            for (let i = 0; i < count; i++) {
                array.setElement(i, this.createMultiArray(classLoader, nextArrayClassName, counts, dimIndex + 1));
            }
            return array;
        }
    }
    static getArrayClassName(componentType) {
        switch (componentType) {
            case array_1.ArrayType.BOOLEAN: return '[Z';
            case array_1.ArrayType.BYTE: return '[B';
            case array_1.ArrayType.CHAR: return '[C';
            case array_1.ArrayType.SHORT: return '[S';
            case array_1.ArrayType.INT: return '[I';
            case array_1.ArrayType.LONG: return '[J';
            case array_1.ArrayType.FLOAT: return '[F';
            case array_1.ArrayType.DOUBLE: return '[D';
            default: throw new Error(`Invalid component type: ${componentType}`);
        }
    }
    static getObjectArrayClassName(componentClassName) {
        return `[L${componentClassName};`;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.NEWARRAY)
], ArrayInstructions, "newarray", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ANEWARRAY)
], ArrayInstructions, "anewarray", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ARRAYLENGTH)
], ArrayInstructions, "arraylength", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.AALOAD)
], ArrayInstructions, "aaload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.AASTORE)
], ArrayInstructions, "aastore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.BALOAD)
], ArrayInstructions, "baload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.BASTORE)
], ArrayInstructions, "bastore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.CALOAD)
], ArrayInstructions, "caload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.CASTORE)
], ArrayInstructions, "castore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.SALOAD)
], ArrayInstructions, "saload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.SASTORE)
], ArrayInstructions, "sastore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IALOAD)
], ArrayInstructions, "iaload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.IASTORE)
], ArrayInstructions, "iastore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LALOAD)
], ArrayInstructions, "laload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LASTORE)
], ArrayInstructions, "lastore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.FALOAD)
], ArrayInstructions, "faload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.FASTORE)
], ArrayInstructions, "fastore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DALOAD)
], ArrayInstructions, "daload", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.DASTORE)
], ArrayInstructions, "dastore", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.MULTIANEWARRAY)
], ArrayInstructions, "multianewarray", null);
exports.ArrayInstructions = ArrayInstructions;
//# sourceMappingURL=array-instructions.js.map