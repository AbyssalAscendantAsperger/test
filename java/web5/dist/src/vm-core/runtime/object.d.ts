import { ClassInfo } from "../classfile/class-info";
import { JavaValue } from "../core/types";
export declare class JavaObject {
    readonly classInfo: ClassInfo;
    private fields;
    readonly id: number;
    private classObject;
    private identityHash;
    private static nextId;
    private static classLoader;
    static setClassLoader(loader: any): void;
    constructor(classInfo: ClassInfo);
    private initializeFields;
    private initializeSuperClassFields;
    private getDefaultValue;
    getField(name: string, descriptor: string): JavaValue;
    setField(name: string, descriptor: string, value: JavaValue): void;
    private makeFieldKey;
    instanceof(className: string): boolean;
    private isInstanceOfSuperClass;
    getClassName(): string;
    toString(): string;
    printFields(): string;
    getClassObject(): any;
    setClassObject(classObject: any): void;
    getIdentityHashCode(): number;
}
