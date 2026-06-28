"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvokeInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
const frame_1 = require("../frame");
const method_info_1 = require("../../classfile/method-info");
const native_registry_1 = require("../../native/native-registry");
const class_loader_1 = require("../../classfile/class-loader");
class InvokeInstructions {
    static invokeMethod(frame, thread, method) {
        if (method.isNative()) {
            const handler = native_registry_1.NativeRegistry.get(method.classInfo.thisClass, method.name, method.descriptor);
            if (!handler) {
                throw new Error(`UnsatisfiedLinkError: ${method.classInfo.thisClass}.${method.name}${method.descriptor}`);
            }
            handler(frame, thread);
        }
        else {
            const newFrame = new frame_1.Frame(method, frame);
            const argCount = method.getParameterCount();
            const slotCount = argCount + (method.isStatic() ? 0 : 1);
            for (let i = slotCount - 1; i >= 0; i--) {
                const val = frame.stack.pop();
                newFrame.setLocal(i, val);
            }
            thread.pushFrame(newFrame);
        }
    }
    static invokespecial(frame, thread) {
        const code = frame.method.getCode();
        const index = (code.code[frame.pc + 1] << 8) | code.code[frame.pc + 2];
        const methodRef = frame.method.classInfo.constantPool.getMethodRef(index);
        const classLoader = frame.method.classInfo.classLoader ||
            frame.method.classInfo.classLoader ||
            new class_loader_1.ClassLoader({ readClass: () => null });
        const classInfo = classLoader.loadClass(methodRef.className);
        const method = classInfo.getMethod(methodRef.methodName, methodRef.descriptor);
        if (!method) {
            throw new Error(`NoSuchMethodError: ${methodRef.className}.${methodRef.methodName}${methodRef.descriptor}`);
        }
        InvokeInstructions.invokeMethod(frame, thread, method);
        frame.pc += 3;
    }
    static invokevirtual(frame, thread) {
        const code = frame.method.getCode();
        const index = (code.code[frame.pc + 1] << 8) | code.code[frame.pc + 2];
        const methodRef = frame.method.classInfo.constantPool.getMethodRef(index);
        const argCount = method_info_1.MethodInfo.prototype.getParameterTypes.call({ descriptor: methodRef.descriptor }).length;
        console.log(`[DEBUG] invokevirtual: ${methodRef.className}.${methodRef.methodName}${methodRef.descriptor}, argCount=${argCount}, stackSize=${frame.stack.size()}, stack: ${frame.stack.toString()}`);
        const thisObj = frame.stack.peek(argCount);
        if (!thisObj) {
            throw new Error("NullPointerException: Cannot invoke method on null object");
        }
        const classLoader = frame.method.classInfo.classLoader ||
            frame.method.classInfo.classLoader ||
            new class_loader_1.ClassLoader({ readClass: () => null });
        let targetClass = thisObj.classInfo;
        let method = null;
        while (targetClass && !method) {
            method = targetClass.getMethod(methodRef.methodName, methodRef.descriptor);
            if (!method && targetClass.superClass) {
                targetClass = classLoader.loadClass(targetClass.superClass);
            }
            else {
                break;
            }
        }
        if (!method) {
            throw new Error(`NoSuchMethodError: ${methodRef.className}.${methodRef.methodName}${methodRef.descriptor}`);
        }
        InvokeInstructions.invokeMethod(frame, thread, method);
        frame.pc += 3;
    }
    static invokestatic(frame, thread) {
        const code = frame.method.getCode();
        const index = (code.code[frame.pc + 1] << 8) | code.code[frame.pc + 2];
        const methodRef = frame.method.classInfo.constantPool.getMethodRef(index);
        const classLoader = frame.method.classInfo.classLoader ||
            frame.method.classInfo.classLoader ||
            new class_loader_1.ClassLoader({ readClass: () => null });
        const classInfo = classLoader.loadClass(methodRef.className);
        const method = classInfo.getMethod(methodRef.methodName, methodRef.descriptor);
        if (!method) {
            throw new Error(`NoSuchMethodError: ${methodRef.className}.${methodRef.methodName}${methodRef.descriptor}`);
        }
        if (!method.isStatic()) {
            throw new Error(`IncompatibleClassChangeError: Expected static method`);
        }
        InvokeInstructions.invokeMethod(frame, thread, method);
        frame.pc += 3;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.INVOKESPECIAL)
], InvokeInstructions, "invokespecial", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.INVOKEVIRTUAL)
], InvokeInstructions, "invokevirtual", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.INVOKESTATIC)
], InvokeInstructions, "invokestatic", null);
exports.InvokeInstructions = InvokeInstructions;
//# sourceMappingURL=invoke.js.map