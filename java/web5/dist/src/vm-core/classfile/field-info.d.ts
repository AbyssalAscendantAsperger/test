import { ClassFileReader } from "./reader";
import { ConstantPool } from "./constant-pool";
import { Attribute } from "./attributes";
export declare class FieldInfo {
    readonly accessFlags: number;
    readonly name: string;
    readonly descriptor: string;
    readonly attributes: Attribute[];
    constructor(reader: ClassFileReader, constantPool: ConstantPool);
    isStatic(): boolean;
    isFinal(): boolean;
    isPublic(): boolean;
    isPrivate(): boolean;
    isProtected(): boolean;
    isPrimitive(): boolean;
    getSize(): number;
    getSignature(): string;
    toString(): string;
}
export declare function parseFields(reader: ClassFileReader, constantPool: ConstantPool): FieldInfo[];
