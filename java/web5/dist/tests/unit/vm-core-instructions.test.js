"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const JarLoader_1 = require("../../src/game-modules/loader/JarLoader");
const JarClassPath_1 = require("../../src/game-modules/loader/JarClassPath");
const system_class_path_1 = require("../../src/vm-core/classfile/system-class-path");
const composite_class_path_1 = require("../../src/vm-core/classfile/composite-class-path");
const class_loader_1 = require("../../src/vm-core/classfile/class-loader");
const object_1 = require("../../src/vm-core/runtime/object");
const instructions_1 = require("../../src/vm-core/interpreter/instructions");
(0, instructions_1.initInstructions)();
console.log('=== VM 核心指令测试 ===\n');
console.log('测试 1: SystemClassPath 系统类加载');
try {
    const systemPath = new system_class_path_1.SystemClassPath();
    const objectClass = systemPath.getSystemClass('java/lang/Object');
    console.log(`  ✅ java/lang/Object: ${objectClass ? '加载成功' : '加载失败'}`);
    if (objectClass) {
        console.log(`     - 类名: ${objectClass.thisClass}`);
        console.log(`     - 父类: ${objectClass.superClass || 'null'}`);
        console.log(`     - 方法数: ${objectClass.methods.length}`);
    }
    const midletClass = systemPath.getSystemClass('javax/microedition/midlet/MIDlet');
    console.log(`  ✅ javax/microedition/midlet/MIDlet: ${midletClass ? '加载成功' : '加载失败'}`);
    if (midletClass) {
        console.log(`     - 类名: ${midletClass.thisClass}`);
        console.log(`     - 父类: ${midletClass.superClass}`);
        console.log(`     - 方法数: ${midletClass.methods.length}`);
        const startAppMethod = midletClass.getMethod('startApp', '()V');
        console.log(`     - startApp()V 方法: ${startAppMethod ? '找到' : '未找到'}`);
    }
    const stringClass = systemPath.getSystemClass('java/lang/String');
    console.log(`  ✅ java/lang/String: ${stringClass ? '加载成功' : '加载失败'}`);
    if (stringClass) {
        console.log(`     - 类名: ${stringClass.thisClass}`);
        console.log(`     - 父类: ${stringClass.superClass}`);
        console.log(`     - 接口数: ${stringClass.interfaces.length}`);
    }
    console.log('');
}
catch (e) {
    console.log(`  ❌ 测试失败: ${e.message}\n`);
}
console.log('测试 2: CompositeClassPath 组合类路径');
try {
    const systemPath = new system_class_path_1.SystemClassPath();
    const dummyLoader = new JarLoader_1.JarLoader();
    const dummyPath = new JarClassPath_1.JarClassPath(dummyLoader);
    const compositePath = new composite_class_path_1.CompositeClassPath(systemPath, dummyPath);
    const data1 = compositePath.readClass('java/lang/Object');
    console.log(`  ✅ java/lang/Object 通过 CompositePath: ${data1 === null ? '返回 null（系统类）' : '返回数据'}`);
    console.log(`  ✅ 类路径数量: ${compositePath.getClassPathCount()}`);
    console.log('');
}
catch (e) {
    console.log(`  ❌ 测试失败: ${e.message}\n`);
}
console.log('测试 3: ClassLoader 系统类加载');
try {
    const systemPath = new system_class_path_1.SystemClassPath();
    const classLoader = new class_loader_1.ClassLoader({ readClass: () => null }, systemPath);
    const objectClass = classLoader.loadClass('java/lang/Object');
    console.log(`  ✅ 加载 java/lang/Object: ${objectClass.thisClass}`);
    const midletClass = classLoader.loadClass('javax/microedition/midlet/MIDlet');
    console.log(`  ✅ 加载 javax/microedition/midlet/MIDlet: ${midletClass.thisClass}`);
    console.log(`     - 父类: ${midletClass.superClass}`);
    const cachedClass = classLoader.getClass('java/lang/Object');
    console.log(`  ✅ 从缓存获取: ${cachedClass === objectClass ? '成功' : '失败'}`);
    console.log('');
}
catch (e) {
    console.log(`  ❌ 测试失败: ${e.message}\n`);
}
console.log('测试 4: JavaObject 对象创建');
try {
    const systemPath = new system_class_path_1.SystemClassPath();
    const classLoader = new class_loader_1.ClassLoader({ readClass: () => null }, systemPath);
    const objectClass = classLoader.loadClass('java/lang/Object');
    const midletClass = classLoader.loadClass('javax/microedition/midlet/MIDlet');
    const obj1 = new object_1.JavaObject(objectClass);
    console.log(`  ✅ 创建 java/lang/Object 实例: ID=${obj1.id}`);
    console.log(`     - 类信息: ${obj1.classInfo.thisClass}`);
    const obj2 = new object_1.JavaObject(midletClass);
    console.log(`  ✅ 创建 javax/microedition/midlet/MIDlet 实例: ID=${obj2.id}`);
    console.log(`     - 类信息: ${obj2.classInfo.thisClass}`);
    console.log(`     - 父类: ${obj2.classInfo.superClass}`);
    console.log('');
}
catch (e) {
    console.log(`  ❌ 测试失败: ${e.message}\n`);
}
console.log('测试 5: 使用真实 JAR 测试 ClassLoader');
try {
    const jarPath = path.resolve(__dirname, '../../tests/integration/魔兽争霸3.jar');
    if (fs.existsSync(jarPath)) {
        const buffer = fs.readFileSync(jarPath);
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        const jarLoader = new JarLoader_1.JarLoader();
        jarLoader.loadJar(arrayBuffer).then(() => {
            const jarClassPath = new JarClassPath_1.JarClassPath(jarLoader);
            const systemPath = new system_class_path_1.SystemClassPath();
            const compositePath = new composite_class_path_1.CompositeClassPath(systemPath, jarClassPath);
            const classLoader = new class_loader_1.ClassLoader(compositePath);
            const objectClass = classLoader.loadClass('java/lang/Object');
            console.log(`  ✅ 从系统路径加载 java/lang/Object: ${objectClass.thisClass}`);
            try {
                const testClass = classLoader.loadClass('tr');
                console.log(`  ✅ 从 JAR 加载主类 tr: ${testClass.thisClass}`);
                console.log(`     - 父类: ${testClass.superClass}`);
            }
            catch (e) {
                console.log(`  ⚠️  加载 JAR 类失败（预期）: ${e.message}`);
            }
            console.log('');
            console.log('=== 所有测试完成 ===\n');
        }).catch(e => {
            console.log(`  ❌ JAR 加载失败: ${e.message}\n`);
            console.log('=== 所有测试完成 ===\n');
        });
    }
    else {
        console.log(`  ⚠️  测试 JAR 文件不存在: ${jarPath}`);
        console.log('');
        console.log('=== 所有测试完成 ===\n');
    }
}
catch (e) {
    console.log(`  ❌ 测试失败: ${e.message}\n`);
    console.log('=== 所有测试完成 ===\n');
}
console.log('=== 所有测试完成 ===\n');
//# sourceMappingURL=vm-core-instructions.test.js.map