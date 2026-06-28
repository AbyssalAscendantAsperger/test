"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClassNatives = exports.JavaClass = void 0;
const native_registry_1 = require("../../../vm-core/native/native-registry");
const object_1 = require("../../../vm-core/runtime/object");
const Context_1 = require("../../context/Context");
const ByteArrayInputStream_1 = require("../java.io/ByteArrayInputStream");
class JavaClass extends object_1.JavaObject {
    constructor(classInfo) {
        super(classInfo);
        this.representedClass = classInfo;
    }
    getName() {
        return this.representedClass.thisClass;
    }
    getSuperclass() {
        if (!this.representedClass.superClass) {
            return null;
        }
        return null;
    }
    isInterface() {
        return this.representedClass.isInterface();
    }
    isArray() {
        return this.representedClass.thisClass.startsWith("[");
    }
    getSimpleName() {
        return this.representedClass.getSimpleName();
    }
    getResourceAsStream(name) {
        const loader = Context_1.Context.getInstance().getJarLoader();
        let path = name;
        if (name.startsWith('/')) {
            path = name.substring(1);
        }
        else {
            const className = this.getName();
            const lastDot = className.lastIndexOf('.');
            const lastSlash = className.lastIndexOf('/');
            let pkg = "";
            if (lastSlash >= 0) {
                pkg = className.substring(0, lastSlash + 1);
            }
            path = pkg + name;
        }
        const data = loader.getFile(path);
        if (data) {
            return new ByteArrayInputStream_1.ByteArrayInputStream(data);
        }
        return null;
    }
}
exports.JavaClass = JavaClass;
function registerClassNatives() {
    const className = "java/lang/Class";
    native_registry_1.NativeRegistry.register(className, "getName", "()Ljava/lang/String;", (frame, thread) => {
        const thisObj = frame.getLocal(0);
        if (!thisObj) {
            throw new Error("NullPointerException");
        }
        const name = thisObj.getName();
        frame.stack.push(name);
    });
    native_registry_1.NativeRegistry.register(className, "getSuperclass", "()Ljava/lang/Class;", (frame, thread) => {
        const thisObj = frame.getLocal(0);
        if (!thisObj) {
            throw new Error("NullPointerException");
        }
        const superClass = thisObj.getSuperclass();
        frame.stack.push(superClass);
    });
    native_registry_1.NativeRegistry.register(className, "isInterface", "()Z", (frame, thread) => {
        const thisObj = frame.getLocal(0);
        if (!thisObj) {
            throw new Error("NullPointerException");
        }
        frame.stack.push(thisObj.isInterface() ? 1 : 0);
    });
    native_registry_1.NativeRegistry.register(className, "isArray", "()Z", (frame, thread) => {
        const thisObj = frame.getLocal(0);
        if (!thisObj) {
            throw new Error("NullPointerException");
        }
        frame.stack.push(thisObj.isArray() ? 1 : 0);
    });
    native_registry_1.NativeRegistry.register(className, "getResourceAsStream", "(Ljava/lang/String;)Ljava/io/InputStream;", (frame, thread) => {
        const thisObj = frame.getLocal(0);
        const nameObj = frame.getLocal(1);
        if (!thisObj) {
            throw new Error("NullPointerException");
        }
        const name = nameObj;
        const loader = Context_1.Context.getInstance().getJarLoader();
        let pathName = name;
        if (name.startsWith('/')) {
            pathName = name.substring(1);
        }
        else {
            const className = thisObj.getName();
            const lastSlash = className.lastIndexOf('/');
            let pkg = "";
            if (lastSlash >= 0) {
                pkg = className.substring(0, lastSlash + 1);
            }
            pathName = pkg + name;
        }
        const data = loader.getFile(pathName);
        if (!data) {
            frame.stack.push(null);
            return;
        }
        try {
            const classLoader = thread.classLoader;
            const jvmExecutorModule = require('../../../vm-core/vm-executor');
            const executor = new jvmExecutorModule.VMExecutor(classLoader);
            const { JavaArray, ArrayType } = require('../../../vm-core/runtime/array');
            const arrayClass = classLoader.loadClass('[B');
            const length = data.length;
            const byteArray = new JavaArray(arrayClass, ArrayType.BYTE, length);
            for (let i = 0; i < length; i++) {
                byteArray.setElement(i, data[i]);
            }
            const baisClass = classLoader.loadClass('java/io/ByteArrayInputStream');
            const { JavaObject } = require('../../../vm-core/runtime/object');
            const baisObj = new JavaObject(baisClass);
            executor.invokeConstructor(baisObj, "([B)V", [byteArray]);
            frame.stack.push(baisObj);
        }
        catch (e) {
            console.error("Failed to wrap getResourceAsStream:", e);
            frame.stack.push(null);
        }
    });
}
exports.registerClassNatives = registerClassNatives;
//# sourceMappingURL=Class.js.map