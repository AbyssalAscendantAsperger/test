"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frame = void 0;
const stack_1 = require("./stack");
class Frame {
    constructor(method, prev = null) {
        this.pc = 0;
        this.nextPc = 0;
        this.method = method;
        this.prev = prev;
        const code = method.getCode();
        if (code) {
            this.locals = new Array(code.maxLocals).fill(null);
            this.stack = new stack_1.OperandStack(code.maxStack);
        }
        else {
            this.locals = new Array(method.getParameterCount() + 1).fill(null);
            this.stack = new stack_1.OperandStack(0);
        }
    }
    setLocal(index, value) {
        this.locals[index] = value;
    }
    getLocal(index) {
        return this.locals[index];
    }
    getInt(index) {
        return this.locals[index];
    }
    getLong(index) {
        return this.locals[index];
    }
    getFloat(index) {
        return this.locals[index];
    }
    getDouble(index) {
        return this.locals[index];
    }
    getObject(index) {
        return this.locals[index];
    }
    toString() {
        return `Frame[${this.method.getSignature()}] pc=${this.pc}`;
    }
}
exports.Frame = Frame;
//# sourceMappingURL=frame.js.map