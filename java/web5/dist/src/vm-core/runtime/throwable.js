"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowableFactory = exports.JavaThrowable = void 0;
const object_1 = require("./object");
class JavaThrowable extends object_1.JavaObject {
    constructor(classInfo, message) {
        super(classInfo);
        this.message = message || null;
        this.stackTrace = [];
        this.cause = null;
    }
    getMessage() {
        return this.message;
    }
    setMessage(message) {
        this.message = message;
    }
    getStackTrace() {
        return this.stackTrace;
    }
    setStackTrace(stackTrace) {
        this.stackTrace = stackTrace;
    }
    addStackTraceElement(element) {
        this.stackTrace.push(element);
    }
    getCause() {
        return this.cause;
    }
    setCause(cause) {
        this.cause = cause;
    }
    printStackTrace() {
        console.error(`${this.classInfo.thisClass}: ${this.message || ""}`);
        for (const element of this.stackTrace) {
            console.error(`  at ${element.className}.${element.methodName}(${element.fileName}:${element.lineNumber})`);
        }
        if (this.cause) {
            console.error("Caused by:");
            this.cause.printStackTrace();
        }
    }
    toString() {
        return `${this.classInfo.thisClass}: ${this.message || ""}`;
    }
}
exports.JavaThrowable = JavaThrowable;
class ThrowableFactory {
    static createNullPointerException(message) {
        const classInfo = ThrowableFactory.createMockClassInfo("java/lang/NullPointerException");
        return new JavaThrowable(classInfo, message || "null");
    }
    static createArrayIndexOutOfBoundsException(index) {
        const classInfo = ThrowableFactory.createMockClassInfo("java/lang/ArrayIndexOutOfBoundsException");
        return new JavaThrowable(classInfo, `Index ${index} out of bounds`);
    }
    static createClassCastException(message) {
        const classInfo = ThrowableFactory.createMockClassInfo("java/lang/ClassCastException");
        return new JavaThrowable(classInfo, message);
    }
    static createArithmeticException(message) {
        const classInfo = ThrowableFactory.createMockClassInfo("java/lang/ArithmeticException");
        return new JavaThrowable(classInfo, message);
    }
    static createIllegalMonitorStateException(message) {
        const classInfo = ThrowableFactory.createMockClassInfo("java/lang/IllegalMonitorStateException");
        return new JavaThrowable(classInfo, message);
    }
    static createMockClassInfo(className) {
        return {
            thisClass: className,
            superClass: "java/lang/Throwable",
            interfaces: [],
            accessFlags: 0x0001,
            fields: [],
            methods: [],
            constantPool: { getSize: () => 0 },
            isPublic: () => true,
            isFinal: () => false,
            isInterface: () => false,
            isAbstract: () => false,
            getJavaVersion: () => "1.1",
            getInstanceFields: () => [],
            getStaticFields: () => [],
        };
    }
}
exports.ThrowableFactory = ThrowableFactory;
//# sourceMappingURL=throwable.js.map