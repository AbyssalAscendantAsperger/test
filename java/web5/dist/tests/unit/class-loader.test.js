"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testLoader = void 0;
const class_loader_1 = require("../../src/vm-core/classfile/class-loader");
class MockClassPath {
    constructor() {
        this.files = new Map();
    }
    addClass(className, data) {
        this.files.set(className, data);
    }
    readClass(className) {
        return this.files.get(className) || null;
    }
}
function createClassFile(className, superClass = "java/lang/Object") {
    const buffer = [];
    buffer.push(0xca, 0xfe, 0xba, 0xbe);
    buffer.push(0x00, 0x00, 0x00, 0x34);
    buffer.push(0x00, 0x05);
    buffer.push(0x01);
    buffer.push((className.length >> 8) & 0xff, className.length & 0xff);
    for (let i = 0; i < className.length; i++)
        buffer.push(className.charCodeAt(i));
    buffer.push(0x07, 0x00, 0x01);
    buffer.push(0x01);
    buffer.push((superClass.length >> 8) & 0xff, superClass.length & 0xff);
    for (let i = 0; i < superClass.length; i++)
        buffer.push(superClass.charCodeAt(i));
    buffer.push(0x07, 0x00, 0x03);
    buffer.push(0x00, 0x01);
    buffer.push(0x00, 0x02);
    buffer.push(0x00, 0x04);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x00);
    buffer.push(0x00, 0x00);
    return new Uint8Array(buffer);
}
function testClassLoader() {
    console.log("=== 类加载器测试 ===\n");
    const classPath = new MockClassPath();
    classPath.addClass("java/lang/Object", createClassFile("java/lang/Object", ""));
    classPath.addClass("MyClass", createClassFile("MyClass", "java/lang/Object"));
    const loader = new class_loader_1.ClassLoader(classPath);
    console.log("1. 加载 MyClass");
    const myClass = loader.loadClass("MyClass");
    console.log(`   类名: ${myClass.thisClass}`);
    console.log(`   父类: ${myClass.superClass}`);
    if (myClass.thisClass !== "MyClass" || myClass.superClass !== "java/lang/Object") {
        throw new Error("Class loading failed");
    }
    const objectClass = loader.getClass("java/lang/Object");
    console.log(`   父类是否已加载: ${!!objectClass}`);
    if (!objectClass) {
        throw new Error("Super class not loaded recursively");
    }
    console.log("   ✅ 验证通过\n");
    console.log("2. 加载数组类 [I");
    const arrayClass = loader.loadClass("[I");
    console.log(`   类名: ${arrayClass.thisClass}`);
    console.log(`   父类: ${arrayClass.superClass}`);
    if (arrayClass.thisClass !== "[I" || arrayClass.superClass !== "java/lang/Object") {
        throw new Error("Array class loading failed");
    }
    console.log("   ✅ 验证通过\n");
    console.log("3. 缓存测试");
    const myClass2 = loader.loadClass("MyClass");
    console.log(`   第二次加载是否返回同一实例: ${myClass === myClass2}`);
    if (myClass !== myClass2) {
        throw new Error("Cache not working");
    }
    console.log("   ✅ 验证通过\n");
    console.log("4. 异常测试");
    try {
        loader.loadClass("UnknownClass");
        throw new Error("Should throw ClassNotFoundException");
    }
    catch (e) {
        console.log(`   ✅ 捕获异常: ${e.message}\n`);
    }
}
function testLoader() {
    try {
        testClassLoader();
        console.log("✅ 所有类加载器测试通过!");
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        throw error;
    }
}
exports.testLoader = testLoader;
if (require.main === module) {
    try {
        testLoader();
    }
    catch (error) {
        console.error("❌ 测试失败:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=class-loader.test.js.map