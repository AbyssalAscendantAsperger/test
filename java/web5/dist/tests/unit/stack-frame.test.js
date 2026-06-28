"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testStackFrame = void 0;
const stack_1 = require("../../src/vm-core/interpreter/stack");
const frame_1 = require("../../src/vm-core/interpreter/frame");
function testOperandStack() {
    console.log("=== 操作数栈测试 ===\n");
    const stack = new stack_1.OperandStack(10);
    console.log("1. 基本 Push/Pop");
    stack.push(42);
    stack.push(3.14);
    stack.push(1234567890123456789n);
    console.log(`   栈状态: ${stack.toString()}`);
    console.log(`   栈深度: ${stack.size()}`);
    const longVal = stack.popLong();
    const floatVal = stack.popFloat();
    const intVal = stack.popInt();
    console.log(`   Pop Long: ${longVal}n`);
    console.log(`   Pop Float: ${floatVal}`);
    console.log(`   Pop Int: ${intVal}`);
    if (longVal !== 1234567890123456789n || floatVal !== 3.14 || intVal !== 42) {
        throw new Error("Stack push/pop failed");
    }
    console.log("   ✅ 验证通过\n");
    console.log("2. 边界测试");
    try {
        stack.pop();
        throw new Error("Should throw StackUnderflowError");
    }
    catch (e) {
        console.log(`   ✅ 捕获下溢: ${e.message}`);
    }
    const smallStack = new stack_1.OperandStack(2);
    smallStack.push(1);
    smallStack.push(2);
    try {
        smallStack.push(3);
        throw new Error("Should throw StackOverflowError");
    }
    catch (e) {
        console.log(`   ✅ 捕获溢出: ${e.message}\n`);
    }
}
function testFrame() {
    console.log("=== 栈帧测试 ===\n");
    const mockMethod = {
        getSignature: () => "test()V",
        getCode: () => ({
            maxStack: 5,
            maxLocals: 5,
            code: new Uint8Array(0)
        }),
        getParameterCount: () => 0
    };
    const frame = new frame_1.Frame(mockMethod);
    console.log("1. 局部变量表");
    frame.setLocal(0, 100);
    frame.setLocal(1, 200n);
    frame.setLocal(2, null);
    console.log(`   Local[0] (int): ${frame.getInt(0)}`);
    console.log(`   Local[1] (long): ${frame.getLong(1)}n`);
    console.log(`   Local[2] (ref): ${frame.getLocal(2)}`);
    if (frame.getInt(0) !== 100 || frame.getLong(1) !== 200n) {
        throw new Error("Locals set/get failed");
    }
    console.log("   ✅ 验证通过\n");
    console.log("2. 栈帧操作数栈");
    frame.stack.push(999);
    console.log(`   Stack Peek: ${frame.stack.peek()}`);
    if (frame.stack.pop() !== 999) {
        throw new Error("Frame stack failed");
    }
    console.log("   ✅ 验证通过\n");
}
function testStackFrame() {
    try {
        testOperandStack();
        testFrame();
        console.log("✅ 所有栈帧测试通过!");
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        throw error;
    }
}
exports.testStackFrame = testStackFrame;
if (require.main === module) {
    try {
        testStackFrame();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=stack-frame.test.js.map