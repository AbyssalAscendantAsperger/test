"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperandStack = void 0;
class OperandStack {
    constructor(maxStack) {
        this.stack = new Array(maxStack);
        this.sp = 0;
    }
    push(value) {
        if (this.sp >= this.stack.length) {
            throw new Error("StackOverflowError");
        }
        this.stack[this.sp++] = value;
    }
    pop() {
        if (this.sp <= 0) {
            throw new Error("StackUnderflowError");
        }
        const value = this.stack[--this.sp];
        this.stack[this.sp] = null;
        return value;
    }
    popInt() {
        return this.pop();
    }
    popFloat() {
        return this.pop();
    }
    popLong() {
        return this.pop();
    }
    popDouble() {
        return this.pop();
    }
    popRef() {
        return this.pop();
    }
    pushLong(value) {
        this.push(value);
    }
    pushDouble(value) {
        this.push(value);
    }
    peek(offset = 0) {
        if (this.sp - offset - 1 < 0) {
            throw new Error("StackUnderflowError");
        }
        return this.stack[this.sp - offset - 1];
    }
    size() {
        return this.sp;
    }
    clear() {
        this.sp = 0;
        for (let i = 0; i < this.stack.length; i++) {
            this.stack[i] = null;
        }
    }
    toString() {
        return `Stack[${this.sp}]: ${this.stack.slice(0, this.sp).map(v => typeof v === 'bigint' ? `${v}n` : String(v)).join(", ")}`;
    }
}
exports.OperandStack = OperandStack;
//# sourceMappingURL=stack.js.map