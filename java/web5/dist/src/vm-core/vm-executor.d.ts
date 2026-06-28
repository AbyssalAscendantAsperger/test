import { ClassLoader } from "./classfile/class-loader";
import { JavaObject } from "./runtime/object";
import { MethodInfo } from "./classfile/method-info";
import { JavaValue } from "./core/types";
export declare class VMExecutor {
    private classLoader;
    constructor(classLoader: ClassLoader);
    createInstance(className: string): JavaObject;
    invokeConstructor(instance: JavaObject, descriptor: string, args?: JavaValue[]): void;
    invokeMethod(instance: JavaObject | null, method: MethodInfo, args?: JavaValue[]): JavaValue;
    invokeStaticMethod(className: string, methodName: string, descriptor: string, args?: JavaValue[]): JavaValue;
    invokeInstanceMethod(instance: JavaObject, methodName: string, descriptor: string, args?: JavaValue[]): JavaValue;
}
