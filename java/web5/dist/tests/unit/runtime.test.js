"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRuntime = void 0;
const class_info_1 = require("../../src/vm-core/classfile/class-info");
const object_1 = require("../../src/vm-core/runtime/object");
const array_1 = require("../../src/vm-core/runtime/array");
const string_1 = require("../../src/vm-core/runtime/string");
function createTestClass() {
    const buffer = [];
    buffer.push(0xca, 0xfe, 0xba, 0xbe);
    buffer.push(0x00, 0x00, 0x00, 0x34);
    buffer.push(0x00, 0x07);
    buffer.push(0x01, 0x00, 0x05);
    buffer.push(...Array.from("Point").map((c) => c.charCodeAt(0)));
    buffer.push(0x07, 0x00, 0x01);
    buffer.push(0x01, 0x00, 0x10);
    buffer.push(...Array.from("java/lang/Object").map((c) => c.charCodeAt(0)));
    buffer.push(0x07, 0x00, 0x03);
    buffer.push(0x01, 0x00, 0x01, 0x78);
    buffer.push(0x01, 0x00, 0x01, 0x49);
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x02, 0x00, 0x04);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x05);
    buffer.push(0x00, 0x06);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x00);
    return new Uint8Array(buffer);
}
function testJavaObject() {
    console.log("=== JavaObject 测试 ===\n");
    const classFile = createTestClass();
    const classInfo = new class_info_1.ClassInfo(classFile);
    const obj = new object_1.JavaObject(classInfo);
    console.log(`1. 创建对象: ${obj.toString()}`);
    console.log(`   类名: ${obj.getClassName()}\n`);
    obj.setField("x", "I", 42);
    console.log(`2. 设置字段 x = 42`);
    const x = obj.getField("x", "I");
    console.log(`3. 获取字段 x = ${x}\n`);
    console.log("4. 所有字段:");
    console.log(obj.printFields());
    console.log();
}
function testJavaArray() {
    console.log("=== JavaArray 测试 ===\n");
    const intArray = array_1.JavaArray.createFromDescriptor("I", 5);
    console.log(`1. 创建 int 数组: ${intArray.toString()}`);
    console.log(`   是否为基本类型数组: ${intArray.isPrimitiveArray()}\n`);
    for (let i = 0; i < intArray.length; i++) {
        intArray.set(i, i * 10);
    }
    console.log(`2. 填充数组:`);
    console.log(`   ${intArray.printElements()}\n`);
    const longArray = array_1.JavaArray.createFromDescriptor("J", 3);
    longArray.set(0, 100n);
    longArray.set(1, 200n);
    longArray.set(2, 9007199254740991n);
    console.log(`3. long 数组:`);
    console.log(`   ${longArray.printElements()}\n`);
    const destArray = array_1.JavaArray.createFromDescriptor("I", 5);
    intArray.copyTo(destArray, 0, 0, 5);
    console.log(`4. 数组复制:`);
    console.log(`   源: ${intArray.printElements()}`);
    console.log(`   目标: ${destArray.printElements()}\n`);
}
function testJavaString() {
    console.log("=== JavaString 测试 ===\n");
    const stringClassInfo = { thisClass: "java/lang/String" };
    const str1 = new string_1.JavaString(stringClassInfo, "Hello");
    const str2 = new string_1.JavaString(stringClassInfo, "World");
    console.log(`1. 创建字符串:`);
    console.log(`   str1 = "${str1.getValue()}"`);
    console.log(`   str2 = "${str2.getValue()}"\n`);
    const str3 = str1.concat(str2);
    console.log(`2. 字符串连接:`);
    console.log(`   str1 + str2 = "${str3.getValue()}"\n`);
    console.log(`3. 字符串比较:`);
    console.log(`   str1.equals(str2) = ${str1.equals(str2)}`);
    console.log(`   str1.compareTo(str2) = ${str1.compareTo(str2)}\n`);
    const pool = new string_1.StringPool();
    const s1 = pool.intern(stringClassInfo, "Test");
    const s2 = pool.intern(stringClassInfo, "Test");
    console.log(`4. 字符串池:`);
    console.log(`   s1 === s2: ${s1 === s2} (应该为 true)`);
    console.log(`   池大小: ${pool.size()}\n`);
}
function testRuntime() {
    console.log("=== 运行时对象模型测试 ===\n");
    try {
        testJavaObject();
        testJavaArray();
        testJavaString();
        console.log("✅ 所有运行时测试通过!");
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        throw error;
    }
}
exports.testRuntime = testRuntime;
if (require.main === module) {
    try {
        testRuntime();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}
//# sourceMappingURL=runtime.test.js.map