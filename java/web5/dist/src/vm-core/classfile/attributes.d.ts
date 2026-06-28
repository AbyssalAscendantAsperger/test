import { ClassFileReader } from "./reader";
import { ConstantPool } from "./constant-pool";
export interface Attribute {
    name: string;
    data: Uint8Array;
}
export interface CodeAttribute extends Attribute {
    name: "Code";
    maxStack: number;
    maxLocals: number;
    code: Uint8Array;
    exceptionTable: ExceptionTableEntry[];
    attributes: Attribute[];
}
export interface ExceptionTableEntry {
    startPc: number;
    endPc: number;
    handlerPc: number;
    catchType: number;
}
export interface SourceFileAttribute extends Attribute {
    name: "SourceFile";
    sourceFile: string;
}
export interface LineNumberTableAttribute extends Attribute {
    name: "LineNumberTable";
    lineNumberTable: LineNumberEntry[];
}
export interface LineNumberEntry {
    startPc: number;
    lineNumber: number;
}
export interface LocalVariableTableAttribute extends Attribute {
    name: "LocalVariableTable";
    localVariableTable: LocalVariableEntry[];
}
export interface LocalVariableEntry {
    startPc: number;
    length: number;
    name: string;
    descriptor: string;
    index: number;
}
export declare class AttributeParser {
    private reader;
    private constantPool;
    constructor(reader: ClassFileReader, constantPool: ConstantPool);
    parseAttributes(): Attribute[];
    private parseAttribute;
    private parseCodeAttribute;
    private parseSourceFileAttribute;
    private parseLineNumberTableAttribute;
    private parseLocalVariableTableAttribute;
}
