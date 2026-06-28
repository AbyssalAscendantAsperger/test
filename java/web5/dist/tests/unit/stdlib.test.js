"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testStdlib = void 0;
const stdlib_1 = require("../../src/game-modules/stdlib");
const native_registry_1 = require("../../src/vm-core/native/native-registry");
const thread_1 = require("../../src/vm-core/threading/thread");
const frame_1 = require("../../src/vm-core/interpreter/frame");
const array_1 = require("../../src/vm-core/runtime/array");
(0, stdlib_1.initStdlib)();
function testArrayCopy() {
    console.log("=== System.arraycopy 测试 ===\n");
    const thread = new thread_1.Thread();
    const frame = new frame_1.Frame({
        getCode: () => ({ maxStack: 10, maxLocals: 10, code: new Uint8Array(0) }),
        getParameterCount: () => 0
    });
    thread.pushFrame(frame);
    const src = array_1.JavaArray.createFromDescriptor("I", 5);
    for (let i = 0; i < 5; i++)
        src.set(i, i + 1);
    const dest = array_1.JavaArray.createFromDescriptor("I", 5);
    frame.stack.push(src);
    frame.stack.push(1);
    frame.stack.push(dest);
    frame.stack.push(2);
    frame.stack.push(3);
    console.log("1. 执行 arraycopy(src, 1, dest, 2, 3)");
    console.log(`   源数组: ${src.printElements()}`);
    console.log(`   目标数组(前): ${dest.printElements()}`);
    const handler = native_registry_1.NativeRegistry.get("java/lang/System", "arraycopy", "(Ljava/lang/Object;ILjava/lang/Object;II)V");
    if (!handler)
        throw new Error("System.arraycopy not found");
    handler(frame, thread);
    console.log(`   目标数组(后): ${dest.printElements()}`);
    if (dest.get(0) !== 0 || dest.get(1) !== 0 || dest.get(2) !== 2 || dest.get(3) !== 3 || dest.get(4) !== 4) {
        throw new Error("Array copy failed");
    }
    console.log("   ✅ 验证通过\n");
}
function testStdlib() {
    try {
        testArrayCopy();
        console.log("✅ 所有标准库测试通过!");
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        throw error;
    }
}
exports.testStdlib = testStdlib;
if (require.main === module) {
    try {
        testStdlib();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=stdlib.test.js.map