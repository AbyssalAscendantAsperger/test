"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testClassInfo = void 0;
const class_info_1 = require("../../src/vm-core/classfile/class-info");
function createTestClassFile() {
    const buffer = [];
    buffer.push(0xca, 0xfe, 0xba, 0xbe);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x34);
    buffer.push(0x00, 0x0a);
    buffer.push(0x01, 0x00, 0x09);
    buffer.push(...Array.from("TestClass").map((c) => c.charCodeAt(0)));
    buffer.push(0x07, 0x00, 0x01);
    buffer.push(0x01, 0x00, 0x10);
    buffer.push(...Array.from("java/lang/Object").map((c) => c.charCodeAt(0)));
    buffer.push(0x07, 0x00, 0x03);
    buffer.push(0x01, 0x00, 0x05);
    buffer.push(...Array.from("value").map((c) => c.charCodeAt(0)));
    buffer.push(0x01, 0x00, 0x01);
    buffer.push(0x49);
    buffer.push(0x01, 0x00, 0x08);
    buffer.push(...Array.from("getValue").map((c) => c.charCodeAt(0)));
    buffer.push(0x01, 0x00, 0x03);
    buffer.push(0x28, 0x29, 0x49);
    buffer.push(0x01, 0x00, 0x04);
    buffer.push(...Array.from("Code").map((c) => c.charCodeAt(0)));
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x02);
    buffer.push(0x00, 0x04);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x02);
    buffer.push(0x00, 0x05);
    buffer.push(0x00, 0x06);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x07);
    buffer.push(0x00, 0x08);
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x09);
    buffer.push(0x00, 0x00, 0x00, 0x11);
    buffer.push(0x00, 0x02);
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x00, 0x00, 0x05);
    buffer.push(0x2a);
    buffer.push(0xb4, 0x00, 0x05);
    buffer.push(0xac);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x00);
    return new Uint8Array(buffer);
}
function testClassInfo() {
    console.log("=== ClassInfo 解析测试 ===\n");
    const classFile = createTestClassFile();
    const classInfo = new class_info_1.ClassInfo(classFile);
    console.log("1. 基本信息:");
    console.log(`   类名: ${classInfo.thisClass}`);
    console.log(`   父类: ${classInfo.superClass}`);
    console.log(`   版本: ${classInfo.getJavaVersion()}`);
    console.log(`   访问标志: ${classInfo.isPublic() ? "public" : "non-public"}\n`);
    console.log("2. 字段信息:");
    console.log(`   字段数量: ${classInfo.fields.length}`);
    if (classInfo.fields.length > 0) {
        const field = classInfo.fields[0];
        console.log(`   字段[0]: ${field.toString()}`);
        console.log(`   是否为基本类型: ${field.isPrimitive()}`);
        console.log(`   大小: ${field.getSize()} 字节\n`);
    }
    console.log("3. 方法信息:");
    console.log(`   方法数量: ${classInfo.methods.length}`);
    if (classInfo.methods.length > 0) {
        const method = classInfo.methods[0];
        console.log(`   方法[0]: ${method.name}${method.descriptor}`);
        console.log(`   参数数量: ${method.getParameterCount()}`);
        console.log(`   返回类型: ${method.getReturnType()}`);
        console.log(`   是否有代码: ${method.hasCode()}`);
        const code = method.getCode();
        if (code) {
            console.log(`   最大栈深度: ${code.maxStack}`);
            console.log(`   最大局部变量: ${code.maxLocals}`);
            console.log(`   字节码长度: ${code.code.length} 字节\n`);
        }
    }
    console.log("4. 详细信息:");
    console.log(classInfo.printDetails());
    console.log("\n✅ ClassInfo 解析测试通过!");
}
exports.testClassInfo = testClassInfo;
if (require.main === module) {
    try {
        testClassInfo();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}
//# sourceMappingURL=class-info.test.js.map