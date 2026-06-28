"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionInstructions = exports.JavaException = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
const throwable_1 = require("../../runtime/throwable");
class JavaException extends Error {
    constructor(throwable) {
        super(throwable.getMessage() || throwable.toString());
        this.name = "JavaException";
        this.throwable = throwable;
    }
}
exports.JavaException = JavaException;
class ExceptionInstructions {
    static athrow(frame, thread) {
        const objectref = frame.stack.pop();
        if (objectref === null) {
            throw new Error("NullPointerException: Cannot throw null");
        }
        if (!(objectref instanceof throwable_1.JavaThrowable)) {
            throw new Error("Invalid throwable object");
        }
        objectref.addStackTraceElement({
            className: frame.method.classInfo.thisClass,
            methodName: frame.method.name,
            fileName: frame.method.classInfo.thisClass + ".java",
            lineNumber: frame.pc,
        });
        throw new JavaException(objectref);
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.ATHROW)
], ExceptionInstructions, "athrow", null);
exports.ExceptionInstructions = ExceptionInstructions;
//# sourceMappingURL=exception-instructions.js.map