"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const thread_1 = require("../threading/thread");
const instruction_1 = require("./instruction");
const descriptors_1 = require("../bytecode/descriptors");
const constants_1 = require("../core/constants");
const object_1 = require("../runtime/object");
class Interpreter {
    static *execute(thread) {
        while (thread.status === thread_1.ThreadStatus.RUNNABLE && thread.hasFrames()) {
            const frame = thread.currentFrame();
            const pc = frame.pc;
            const code = frame.method.getCode();
            if (!code) {
                thread.popFrame();
                const returnType = frame.method.getReturnType();
                if (returnType !== 'V' && thread.hasFrames()) {
                    const callerFrame = thread.currentFrame();
                    if (returnType.startsWith('L') || returnType.startsWith('[')) {
                        const returnedClassName = returnType.substring(1, returnType.length - 1);
                        try {
                            const classLoader = thread.classLoader;
                            if (classLoader) {
                                const returnedClassInfo = classLoader.loadClass(returnedClassName);
                                const mockObj = new object_1.JavaObject(returnedClassInfo);
                                callerFrame.stack.push(mockObj);
                            }
                            else {
                                callerFrame.stack.push(null);
                            }
                        }
                        catch (e) {
                            callerFrame.stack.push(null);
                        }
                    }
                    else if (returnType === 'J') {
                        callerFrame.stack.push(0n);
                    }
                    else {
                        callerFrame.stack.push(0);
                    }
                }
                continue;
            }
            if (pc >= code.code.length) {
                thread.popFrame();
                continue;
            }
            const opcode = code.code[pc];
            const handler = instruction_1.InstructionRegistry.get(opcode);
            if (!handler) {
                throw new Error(`Unknown opcode: 0x${opcode.toString(16)} (${(0, descriptors_1.getOpcodeMnemonic)(opcode)}) at pc=${pc}`);
            }
            try {
                handler(frame, thread);
            }
            catch (e) {
                const handled = Interpreter.handleException(thread, e);
                if (!handled) {
                    console.error(`Uncaught exception in ${frame.method.getSignature()} at pc=${pc}`);
                    throw e;
                }
            }
            yield constants_1.ExecutionStatus.RUNNING;
        }
        yield constants_1.ExecutionStatus.TERMINATED;
    }
    static handleException(thread, error) {
        const JavaException = require('./instructions/exception-instructions').JavaException;
        if (!(error instanceof JavaException)) {
            return false;
        }
        const throwable = error.throwable;
        while (thread.hasFrames()) {
            const frame = thread.currentFrame();
            const code = frame.method.getCode();
            if (!code || !code.exceptionTable) {
                thread.popFrame();
                continue;
            }
            const handler = Interpreter.findExceptionHandler(code.exceptionTable, frame.pc, throwable.classInfo.thisClass);
            if (handler) {
                while (frame.stack.size() > 0) {
                    frame.stack.pop();
                }
                frame.stack.push(throwable);
                frame.pc = handler.handlerPc;
                return true;
            }
            thread.popFrame();
        }
        return false;
    }
    static findExceptionHandler(exceptionTable, pc, exceptionClass) {
        for (const handler of exceptionTable) {
            if (pc >= handler.startPc && pc < handler.endPc) {
                if (handler.catchType === 0) {
                    return handler;
                }
                if (handler.catchType === exceptionClass) {
                    return handler;
                }
                if (handler.catchType === 'java/lang/Throwable') {
                    return handler;
                }
            }
        }
        return null;
    }
    static step(thread) {
        if (thread.status === thread_1.ThreadStatus.RUNNABLE && thread.hasFrames()) {
            const frame = thread.currentFrame();
            const pc = frame.pc;
            const code = frame.method.getCode();
            const opcode = code.code[pc];
            const handler = instruction_1.InstructionRegistry.get(opcode);
            if (handler) {
                handler(frame, thread);
            }
            else {
                throw new Error(`Unknown opcode: ${opcode}`);
            }
        }
    }
}
exports.Interpreter = Interpreter;
//# sourceMappingURL=interpreter.js.map