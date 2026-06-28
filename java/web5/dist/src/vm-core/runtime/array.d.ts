import { ClassInfo } from "../classfile/class-info";
import { JavaObject } from "./object";
import { JavaValue } from "../core/types";
export declare enum ArrayType {
    BOOLEAN = 4,
    CHAR = 5,
    FLOAT = 6,
    DOUBLE = 7,
    BYTE = 8,
    SHORT = 9,
    INT = 10,
    LONG = 11,
    OBJECT = 100
}
export declare class JavaArray extends JavaObject {
    readonly componentType: ArrayType;
    readonly length: number;
    private elements;
    constructor(classInfo: ClassInfo, componentType: ArrayType, length: number);
    static createFromDescriptor(descriptor: string, length: number): JavaArray;
    private initializeElements;
    private getArrayDefaultValue;
    getElement(index: number): JavaValue;
    setElement(index: number, value: JavaValue): void;
    private isValidElement;
    getElements(): JavaValue[];
    get(index: number): JavaValue;
    set(index: number, value: JavaValue): void;
    copyTo(dest: JavaArray, srcPos: number, destPos: number, length: number): void;
    printElements(): string;
    isPrimitiveArray(): boolean;
}
export declare function getArrayTypeFromDescriptor(descriptor: string): ArrayType;
export declare function getDescriptorFromArrayType(arrayType: ArrayType): string;
