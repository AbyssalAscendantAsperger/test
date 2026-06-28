"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VMExecutor = void 0;
const thread_1 = require("./threading/thread");
const interpreter_1 = require("./interpreter/interpreter");
const frame_1 = require("./interpreter/frame");
const object_1 = require("./runtime/object");
class VMExecutor {
    constructor(classLoader) {
        this.classLoader = classLoader;
    }
    createInstance(className) {
        const classInfo = this.classLoader.loadClass(className);
        const instance = new object_1.JavaObject(classInfo);
        return instance;
    }
    invokeConstructor(instance, descriptor, args = []) {
        const constructor = instance.classInfo.methods.find(m => m.name === "<init>" && m.descriptor === descriptor);
        if (!constructor) {
            throw new Error(`Constructor not found: ${instance.classInfo.thisClass}.<init>${descriptor}`);
        }
        this.invokeMethod(instance, constructor, args);
    }
    invokeMethod(instance, method, args = []) {
        const thread = new thread_1.Thread();
        thread.classLoader = this.classLoader;
        const locals = [];
        if (instance !== null) {
            locals.push(instance);
        }
        locals.push(...args);
        const frame = new frame_1.Frame(method);
        for (let i = 0; i < locals.length; i++) {
            frame.setLocal(i, locals[i]);
        }
        thread.pushFrame(frame);
        const executor = interpreter_1.Interpreter.execute(thread);
        let result = executor.next();
        while (!result.done) {
            result = executor.next();
        }
        if (thread.hasFrames()) {
            const returnFrame = thread.currentFrame();
            if (returnFrame.stack.size() > 0) {
                return returnFrame.stack.pop();
            }
        }
        return null;
    }
    invokeStaticMethod(className, methodName, descriptor, args = []) {
        const classInfo = this.classLoader.loadClass(className);
        const method = classInfo.methods.find(m => m.name === methodName && m.descriptor === descriptor);
        if (!method) {
            throw new Error(`Static method not found: ${className}.${methodName}${descriptor}`);
        }
        return this.invokeMethod(null, method, args);
    }
    invokeInstanceMethod(instance, methodName, descriptor, args = []) {
        const method = instance.classInfo.methods.find(m => m.name === methodName && m.descriptor === descriptor);
        if (!method) {
            throw new Error(`Instance method not found: ${instance.classInfo.thisClass}.${methodName}${descriptor}`);
        }
        return this.invokeMethod(instance, method, args);
    }
}
exports.VMExecutor = VMExecutor;
//# sourceMappingURL=vm-executor.js.map