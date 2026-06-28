"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConstantPool = void 0;
const reader_1 = require("../../src/vm-core/classfile/reader");
const constant_pool_1 = require("../../src/vm-core/classfile/constant-pool");
const constants_1 = require("../../src/vm-core/core/constants");
function createMinimalClassFile() {
    const buffer = [];
    buffer.push(0xca, 0xfe, 0xba, 0xbe);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x2d);
    buffer.push(0x00, 0x05);
    buffer.push(0x01);
    buffer.push(0x00, 0x04);
    buffer.push(0x54, 0x65, 0x73, 0x74);
    buffer.push(0x07);
    buffer.push(0x00, 0x01);
    buffer.push(0x03);
    buffer.push(0x00, 0x00, 0x00, 0x2a);
    buffer.push(0x05);
    buffer.push(0x00, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff);
    return new Uint8Array(buffer);
}
function testConstantPool() {
    console.log("=== 常量池解析测试 ===\n");
    const classFile = createMinimalClassFile();
    const reader = new reader_1.ClassFileReader(classFile);
    const magic = reader.readU4();
    console.log(`1. 魔数: 0x${magic.toString(16)} (期望: 0xcafebabe)`);
    if (magic !== constants_1.CLASS_FILE_MAGIC) {
        throw new Error("Invalid class file magic number");
    }
    const minorVersion = reader.readU2();
    const majorVersion = reader.readU2();
    console.log(`2. 版本: ${majorVersion}.${minorVersion}\n`);
    const constantPool = new constant_pool_1.ConstantPool(reader);
    console.log(`3. 常量池大小: ${constantPool.getSize()} 个条目\n`);
    const utf8Value = constantPool.getUtf8(1);
    console.log(`4. UTF-8 常量 [1]: "${utf8Value}" (期望: "Test")`);
    const className = constantPool.getClassName(2);
    console.log(`5. Class 常量 [2]: "${className}" (期望: "Test")`);
    const intEntry = constantPool.get(3);
    console.log(`6. Integer 常量 [3]: ${intEntry.tag === 3 ? intEntry.value : "错误"} (期望: 42)`);
    const longEntry = constantPool.get(4);
    console.log(`7. Long 常量 [4]: ${longEntry.tag === 5 ? longEntry.value : "错误"}n (期望: 9007199254740991n)`);
    console.log("\n✅ 所有测试通过!");
}
exports.testConstantPool = testConstantPool;
if (require.main === module) {
    try {
        testConstantPool();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=constant-pool.test.js.map