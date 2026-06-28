"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSystemNatives = void 0;
const native_registry_1 = require("../../../vm-core/native/native-registry");
const array_1 = require("../../../vm-core/runtime/array");
function registerSystemNatives() {
    const className = "java/lang/System";
    native_registry_1.NativeRegistry.register(className, "currentTimeMillis", "()J", (frame, thread) => {
        const now = BigInt(Date.now());
        frame.stack.push(now);
    });
    native_registry_1.NativeRegistry.register(className, "arraycopy", "(Ljava/lang/Object;ILjava/lang/Object;II)V", (frame, thread) => {
        const length = frame.stack.popInt();
        const destPos = frame.stack.popInt();
        const dest = frame.stack.popRef();
        const srcPos = frame.stack.popInt();
        const src = frame.stack.popRef();
        if (!src || !dest) {
            throw new Error("NullPointerException");
        }
        if (!(src instanceof array_1.JavaArray) || !(dest instanceof array_1.JavaArray)) {
            throw new Error("ArrayStoreException: src or dest is not an array");
        }
        if (srcPos < 0 ||
            destPos < 0 ||
            length < 0 ||
            srcPos + length > src.length ||
            destPos + length > dest.length) {
            throw new Error("ArrayIndexOutOfBoundsException");
        }
        src.copyTo(dest, srcPos, destPos, length);
    });
    native_registry_1.NativeRegistry.register(className, "identityHashCode", "(Ljava/lang/Object;)I", (frame, thread) => {
        const obj = frame.stack.popRef();
        if (!obj) {
            frame.stack.push(0);
        }
        else {
            const javaObj = obj;
            frame.stack.push(javaObj.getIdentityHashCode());
        }
    });
}
exports.registerSystemNatives = registerSystemNatives;
//# sourceMappingURL=System.js.map