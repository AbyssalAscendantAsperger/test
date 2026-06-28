"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testInterpreter = void 0;
const thread_1 = require("../../src/vm-core/threading/thread");
const frame_1 = require("../../src/vm-core/interpreter/frame");
const interpreter_1 = require("../../src/vm-core/interpreter/interpreter");
const opcodes_1 = require("../../src/vm-core/bytecode/opcodes");
const instructions_1 = require("../../src/vm-core/interpreter/instructions");
(0, instructions_1.initInstructions)();
function createMockMethod(code) {
    return {
        getSignature: () => "test()I",
        getCode: () => ({
            maxStack: 10,
            maxLocals: 10,
            code: new Uint8Array(code),
            exceptionTable: [],
            attributes: []
        }),
        getParameterCount: () => 0
    };
}
function testSimpleMath() {
    console.log("=== 简单算术测试 (1 + 2) ===\n");
    const code = [
        opcodes_1.Opcode.ICONST_1,
        opcodes_1.Opcode.ICONST_2,
        opcodes_1.Opcode.IADD,
        opcodes_1.Opcode.IRETURN
    ];
    const method = createMockMethod(code);
    const thread = new thread_1.Thread();
    const callerMethod = createMockMethod([]);
    const callerFrame = new frame_1.Frame(callerMethod);
    thread.pushFrame(callerFrame);
    const frame = new frame_1.Frame(method, callerFrame);
    thread.pushFrame(frame);
    console.log("1. 开始执行...");
    const iterator = interpreter_1.Interpreter.execute(thread);
    let result = iterator.next();
    while (!result.done) {
        result = iterator.next();
    }
    console.log("2. 执行完成");
    const returnValue = callerFrame.stack.popInt();
    console.log(`3. 返回值: ${returnValue}`);
    if (returnValue !== 3) {
        throw new Error(`Expected 3, got ${returnValue}`);
    }
    console.log("✅ 测试通过\n");
}
function testInterpreter() {
    try {
        testSimpleMath();
        console.log("✅ 所有解释器测试通过!");
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        throw error;
    }
}
exports.testInterpreter = testInterpreter;
if (require.main === module) {
    try {
        testInterpreter();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=interpreter.test.js.map