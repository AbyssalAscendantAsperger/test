"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instruction_1 = require("../../src/vm-core/interpreter/instruction");
const instructions_1 = require("../../src/vm-core/interpreter/instructions");
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}
function assertDefined(value, message) {
    assert(value !== null && value !== undefined, message);
}
console.log('=== 指令注册测试 ===');
(0, instructions_1.initInstructions)();
console.log('1. 测试常量指令注册...');
const nopHandler = instruction_1.InstructionRegistry.get(0x00);
const iconst0Handler = instruction_1.InstructionRegistry.get(0x03);
const bipushHandler = instruction_1.InstructionRegistry.get(0x10);
assertDefined(nopHandler, 'NOP 指令应该被注册');
assertDefined(iconst0Handler, 'ICONST_0 指令应该被注册');
assertDefined(bipushHandler, 'BIPUSH 指令应该被注册');
console.log('✅ 常量指令测试通过');
console.log('2. 测试加载指令注册...');
const iloadHandler = instruction_1.InstructionRegistry.get(0x15);
const aloadHandler = instruction_1.InstructionRegistry.get(0x19);
const lloadHandler = instruction_1.InstructionRegistry.get(0x16);
assertDefined(iloadHandler, 'ILOAD 指令应该被注册');
assertDefined(aloadHandler, 'ALOAD 指令应该被注册');
assertDefined(lloadHandler, 'LLOAD 指令应该被注册');
console.log('✅ 加载指令测试通过');
console.log('3. 测试存储指令注册...');
const istoreHandler = instruction_1.InstructionRegistry.get(0x36);
const astoreHandler = instruction_1.InstructionRegistry.get(0x3a);
const lstoreHandler = instruction_1.InstructionRegistry.get(0x37);
assertDefined(istoreHandler, 'ISTORE 指令应该被注册');
assertDefined(astoreHandler, 'ASTORE 指令应该被注册');
assertDefined(lstoreHandler, 'LSTORE 指令应该被注册');
console.log('✅ 存储指令测试通过');
console.log('4. 测试数学指令注册...');
const iaddHandler = instruction_1.InstructionRegistry.get(0x60);
const isubHandler = instruction_1.InstructionRegistry.get(0x64);
const imulHandler = instruction_1.InstructionRegistry.get(0x68);
assertDefined(iaddHandler, 'IADD 指令应该被注册');
assertDefined(isubHandler, 'ISUB 指令应该被注册');
assertDefined(imulHandler, 'IMUL 指令应该被注册');
console.log('✅ 数学指令测试通过');
console.log('5. 测试控制流指令注册...');
const returnHandler = instruction_1.InstructionRegistry.get(0xb1);
const ireturnHandler = instruction_1.InstructionRegistry.get(0xac);
assertDefined(returnHandler, 'RETURN 指令应该被注册');
assertDefined(ireturnHandler, 'IRETURN 指令应该被注册');
console.log('✅ 控制流指令测试通过');
console.log('6. 测试 InvokeInstructions 导入...');
const registeredCount = instruction_1.InstructionRegistry['handlers'].filter((h) => h !== null).length;
assert(registeredCount > 0, '应该有指令被注册');
console.log(`✅ 已注册指令数量: ${registeredCount}`);
console.log('7. 测试未使用的操作码...');
const unusedHandler = instruction_1.InstructionRegistry.get(0xff);
assert(unusedHandler === null, '未使用的操作码应该返回 null');
console.log('✅ 未使用操作码测试通过');
console.log('\n=== 所有测试通过! ===');
//# sourceMappingURL=instruction-registry.test.js.map