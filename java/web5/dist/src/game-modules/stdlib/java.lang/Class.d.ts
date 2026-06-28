import { JavaObject } from "../../../vm-core/runtime/object";
import { ClassInfo } from "../../../vm-core/classfile/class-info";
import { InputStream } from "../java.io/InputStream";
export declare class JavaClass extends JavaObject {
    readonly representedClass: ClassInfo;
    constructor(classInfo: ClassInfo);
    getName(): string;
    getSuperclass(): JavaClass | null;
    isInterface(): boolean;
    isArray(): boolean;
    getSimpleName(): string;
    getResourceAsStream(name: string): InputStream | null;
}
export declare function registerClassNatives(): void;
