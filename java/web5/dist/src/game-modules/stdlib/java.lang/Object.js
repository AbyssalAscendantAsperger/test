"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerObjectNatives = void 0;
const native_registry_1 = require("../../../vm-core/native/native-registry");
const scheduler_1 = require("../../../vm-core/threading/scheduler");
const constants_1 = require("../../../vm-core/core/constants");
function registerObjectNatives() {
    const className = "java/lang/Object";
    native_registry_1.NativeRegistry.register(className, "hashCode", "()I", (frame, thread) => {
        const thisObj = frame.getLocal(0);
        if (!thisObj) {
            throw new Error("NullPointerException");
        }
        frame.stack.push(thisObj.getIdentityHashCode());
    });
    native_registry_1.NativeRegistry.register(className, "getClass", "()Ljava/lang/Class;", (frame, thread) => {
        const thisObj = frame.getLocal(0);
        if (!thisObj) {
            throw new Error("NullPointerException");
        }
        const classObject = thisObj.getClassObject();
        frame.stack.push(classObject);
    });
    native_registry_1.NativeRegistry.register(className, "clone", "()Ljava/lang/Object;", (frame, thread) => {
        const thisObj = frame.locals[0];
        frame.stack.push(null);
    });
    native_registry_1.NativeRegistry.register(className, "notify", "()V", (frame, thread) => {
        scheduler_1.Scheduler.getInstance().notify(thread.id);
    });
    native_registry_1.NativeRegistry.register(className, "notifyAll", "()V", (frame, thread) => {
        scheduler_1.Scheduler.getInstance().notifyAll();
    });
    native_registry_1.NativeRegistry.register(className, "wait", "(J)V", (frame, thread) => {
        const timeout = frame.stack.popLong();
        thread.waitingForNotify = true;
        if (timeout === 0n) {
            return constants_1.ExecutionStatus.WAITING;
        }
        else {
            return constants_1.ExecutionStatus.TIMED_WAITING;
        }
    });
}
exports.registerObjectNatives = registerObjectNatives;
//# sourceMappingURL=Object.js.map