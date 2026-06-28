import { JavaObject } from "./object";
import { ClassInfo } from "../classfile/class-info";
export declare class JavaThrowable extends JavaObject {
    private message;
    private stackTrace;
    private cause;
    constructor(classInfo: ClassInfo, message?: string);
    getMessage(): string | null;
    setMessage(message: string): void;
    getStackTrace(): StackTraceElement[];
    setStackTrace(stackTrace: StackTraceElement[]): void;
    addStackTraceElement(element: StackTraceElement): void;
    getCause(): JavaThrowable | null;
    setCause(cause: JavaThrowable): void;
    printStackTrace(): void;
    toString(): string;
}
export interface StackTraceElement {
    className: string;
    methodName: string;
    fileName: string;
    lineNumber: number;
}
export declare class ThrowableFactory {
    static createNullPointerException(message?: string): JavaThrowable;
    static createArrayIndexOutOfBoundsException(index: number): JavaThrowable;
    static createClassCastException(message: string): JavaThrowable;
    static createArithmeticException(message: string): JavaThrowable;
    static createIllegalMonitorStateException(message: string): JavaThrowable;
    private static createMockClassInfo;
}
