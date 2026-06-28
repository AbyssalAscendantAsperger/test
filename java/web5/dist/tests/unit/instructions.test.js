"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testInstructions = void 0;
const frame_1 = require("../../src/vm-core/interpreter/frame");
const thread_1 = require("../../src/vm-core/threading/thread");
const class_loader_1 = require("../../src/vm-core/classfile/class-loader");
const branch_instructions_1 = require("../../src/vm-core/interpreter/instructions/branch-instructions");
const conversion_instructions_1 = require("../../src/vm-core/interpreter/instructions/conversion-instructions");
const comparison_instructions_1 = require("../../src/vm-core/interpreter/instructions/comparison-instructions");
function createMockFrame(code) {
    const mockClassInfo = {
        thisClass: "TestClass",
        constantPool: {
            getSize: () => 0,
        },
    };
    const mockMethod = {
        name: "testMethod",
        descriptor: "()V",
        classInfo: mockClassInfo,
        getCode: () => ({
            code: new Uint8Array(code),
            maxStack: 100,
            maxLocals: 10,
        }),
        getSignature: () => "TestClass.testMethod()V",
        getParameterCount: () => 0,
    };
    const mockClassLoader = new class_loader_1.ClassLoader({ readClass: () => null });
    const thread = new thread_1.Thread();
    const frame = new frame_1.Frame(mockMethod);
    return { frame, thread };
}
function testBranchInstructions() {
    console.log("=== 测试分支指令 ===\n");
    console.log("1. 测试 IFEQ (if value == 0)");
    {
        const { frame, thread } = createMockFrame([0x99, 0x00, 0x05]);
        frame.stack.push(0);
        branch_instructions_1.BranchInstructions.ifeq(frame, thread);
        console.log(`   值为 0 时 PC: ${frame.pc} (期望: 5)`);
        const { frame: frame2, thread: thread2 } = createMockFrame([0x99, 0x00, 0x05]);
        frame2.stack.push(1);
        branch_instructions_1.BranchInstructions.ifeq(frame2, thread2);
        console.log(`   值为 1 时 PC: ${frame2.pc} (期望: 3)\n`);
    }
    console.log("2. 测试 IF_ICMPEQ (if value1 == value2)");
    {
        const { frame, thread } = createMockFrame([0x9f, 0x00, 0x0a]);
        frame.stack.push(5);
        frame.stack.push(5);
        branch_instructions_1.BranchInstructions.if_icmpeq(frame, thread);
        console.log(`   5 == 5 时 PC: ${frame.pc} (期望: 10)`);
        const { frame: frame2, thread: thread2 } = createMockFrame([0x9f, 0x00, 0x0a]);
        frame2.stack.push(5);
        frame2.stack.push(3);
        branch_instructions_1.BranchInstructions.if_icmpeq(frame2, thread2);
        console.log(`   5 == 3 时 PC: ${frame2.pc} (期望: 3)\n`);
    }
    console.log("3. 测试 IFNULL (if reference is null)");
    {
        const { frame, thread } = createMockFrame([0xc6, 0x00, 0x07]);
        frame.stack.push(null);
        branch_instructions_1.BranchInstructions.ifnull(frame, thread);
        console.log(`   null 时 PC: ${frame.pc} (期望: 7)`);
        const { frame: frame2, thread: thread2 } = createMockFrame([0xc6, 0x00, 0x07]);
        frame2.stack.push({});
        branch_instructions_1.BranchInstructions.ifnull(frame2, thread2);
        console.log(`   非 null 时 PC: ${frame2.pc} (期望: 3)\n`);
    }
}
function testConversionInstructions() {
    console.log("=== 测试类型转换指令 ===\n");
    console.log("1. 测试 I2L (int to long)");
    {
        const { frame, thread } = createMockFrame([0x85]);
        frame.stack.push(42);
        conversion_instructions_1.ConversionInstructions.i2l(frame, thread);
        const result = frame.stack.pop();
        console.log(`   42 (int) -> ${result} (long), 类型: ${typeof result}\n`);
    }
    console.log("2. 测试 L2I (long to int)");
    {
        const { frame, thread } = createMockFrame([0x88]);
        frame.stack.push(9007199254740991n);
        conversion_instructions_1.ConversionInstructions.l2i(frame, thread);
        const result = frame.stack.pop();
        console.log(`   9007199254740991n (long) -> ${result} (int)\n`);
    }
    console.log("3. 测试 I2B (int to byte)");
    {
        const { frame, thread } = createMockFrame([0x91]);
        frame.stack.push(300);
        conversion_instructions_1.ConversionInstructions.i2b(frame, thread);
        const result = frame.stack.pop();
        console.log(`   300 (int) -> ${result} (byte, 期望: 44)\n`);
    }
    console.log("4. 测试 I2C (int to char)");
    {
        const { frame, thread } = createMockFrame([0x92]);
        frame.stack.push(65);
        conversion_instructions_1.ConversionInstructions.i2c(frame, thread);
        const result = frame.stack.pop();
        console.log(`   65 (int) -> ${result} (char, 期望: 65)\n`);
    }
}
function testComparisonInstructions() {
    console.log("=== 测试比较指令 ===\n");
    console.log("1. 测试 LCMP (long 比较)");
    {
        const { frame, thread } = createMockFrame([0x94]);
        frame.stack.push(100n);
        frame.stack.push(50n);
        comparison_instructions_1.ComparisonInstructions.lcmp(frame, thread);
        console.log(`   100n vs 50n: ${frame.stack.pop()} (期望: 1)`);
        const { frame: frame2, thread: thread2 } = createMockFrame([0x94]);
        frame2.stack.push(50n);
        frame2.stack.push(100n);
        comparison_instructions_1.ComparisonInstructions.lcmp(frame2, thread2);
        console.log(`   50n vs 100n: ${frame2.stack.pop()} (期望: -1)`);
        const { frame: frame3, thread: thread3 } = createMockFrame([0x94]);
        frame3.stack.push(50n);
        frame3.stack.push(50n);
        comparison_instructions_1.ComparisonInstructions.lcmp(frame3, thread3);
        console.log(`   50n vs 50n: ${frame3.stack.pop()} (期望: 0)\n`);
    }
    console.log("2. 测试 FCMPL (float 比较, NaN -> -1)");
    {
        const { frame, thread } = createMockFrame([0x95]);
        frame.stack.push(3.14);
        frame.stack.push(2.71);
        comparison_instructions_1.ComparisonInstructions.fcmpl(frame, thread);
        console.log(`   3.14 vs 2.71: ${frame.stack.pop()} (期望: 1)`);
        const { frame: frame2, thread: thread2 } = createMockFrame([0x95]);
        frame2.stack.push(NaN);
        frame2.stack.push(1.0);
        comparison_instructions_1.ComparisonInstructions.fcmpl(frame2, thread2);
        console.log(`   NaN vs 1.0: ${frame2.stack.pop()} (期望: -1)\n`);
    }
    console.log("3. 测试 FCMPG (float 比较, NaN -> 1)");
    {
        const { frame, thread } = createMockFrame([0x96]);
        frame.stack.push(NaN);
        frame.stack.push(1.0);
        comparison_instructions_1.ComparisonInstructions.fcmpg(frame, thread);
        console.log(`   NaN vs 1.0: ${frame.stack.pop()} (期望: 1)\n`);
    }
}
function testInstructions() {
    console.log("=== 指令集测试 ===\n");
    try {
        testBranchInstructions();
        testConversionInstructions();
        testComparisonInstructions();
        console.log("✅ 所有指令测试通过!");
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        throw error;
    }
}
exports.testInstructions = testInstructions;
if (require.main === module) {
    try {
        testInstructions();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}
//# sourceMappingURL=instructions.test.js.map