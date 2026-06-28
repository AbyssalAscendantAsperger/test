"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testNative = void 0;
const native_registry_1 = require("../../src/vm-core/native/native-registry");
const thread_1 = require("../../src/vm-core/threading/thread");
const frame_1 = require("../../src/vm-core/interpreter/frame");
function testNativeCall() {
    console.log("=== Native 方法调用测试 ===\n");
    const className = "java/lang/System";
    const methodName = "currentTimeMillis";
    const descriptor = "()J";
    console.log(`1. 注册 Native 方法: ${className}.${methodName}${descriptor}`);
    native_registry_1.NativeRegistry.register(className, methodName, descriptor, (frame, thread) => {
        const now = BigInt(Date.now());
        console.log(`   [Native] System.currentTimeMillis() called, returning ${now}n`);
        frame.stack.push(now);
    });
    console.log("2. 模拟调用");
    const thread = new thread_1.Thread();
    const mockMethod = {
        name: methodName,
        descriptor: descriptor,
        isNative: () => true,
        isStatic: () => true,
        getParameterCount: () => 0,
        classInfo: { thisClass: className }
    };
    const callerFrame = new frame_1.Frame({
        getSignature: () => "caller()V",
        getCode: () => ({ maxStack: 5, maxLocals: 5, code: new Uint8Array(0) }),
        getParameterCount: () => 0
    });
    thread.pushFrame(callerFrame);
    const handler = native_registry_1.NativeRegistry.get(className, methodName, descriptor);
    if (!handler) {
        throw new Error("Native handler not found");
    }
    handler(callerFrame, thread);
    const result = callerFrame.stack.popLong();
    console.log(`3. 返回值: ${result}n`);
    if (typeof result !== "bigint") {
        throw new Error("Return value is not bigint");
    }
    const now = BigInt(Date.now());
    if (now - result > 1000n) {
        throw new Error("Return value seems incorrect");
    }
    console.log("✅ 测试通过\n");
}
function testNative() {
    try {
        testNativeCall();
        console.log("✅ 所有 Native 接口测试通过!");
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        throw error;
    }
}
exports.testNative = testNative;
if (require.main === module) {
    try {
        testNative();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=native.test.js.map