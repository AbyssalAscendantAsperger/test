import { ClassFileReader } from "./reader";
import { ConstantValue, ResolvedFieldRef, ResolvedMethodRef } from "./constant-pool-types";
export declare class ConstantPool {
    private entries;
    private resolved;
    private buffer;
    constructor(reader: ClassFileReader);
    private scanEntries;
    get(index: number): ConstantValue;
    private parseEntry;
    private parseUtf8;
    getUtf8(index: number): string;
    getClassName(index: number): string;
    getString(index: number): string;
    getFieldRef(index: number): ResolvedFieldRef;
    getMethodRef(index: number): ResolvedMethodRef;
    getSize(): number;
}
