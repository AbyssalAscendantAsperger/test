import { ConstantTag } from "../core/constants";
export interface ConstantPoolEntry {
    tag: ConstantTag;
}
export interface Utf8Constant extends ConstantPoolEntry {
    tag: ConstantTag.Utf8;
    bytes: Uint8Array;
    value?: string;
}
export interface IntegerConstant extends ConstantPoolEntry {
    tag: ConstantTag.Integer;
    value: number;
}
export interface FloatConstant extends ConstantPoolEntry {
    tag: ConstantTag.Float;
    value: number;
}
export interface LongConstant extends ConstantPoolEntry {
    tag: ConstantTag.Long;
    value: bigint;
}
export interface DoubleConstant extends ConstantPoolEntry {
    tag: ConstantTag.Double;
    value: number;
}
export interface ClassConstant extends ConstantPoolEntry {
    tag: ConstantTag.Class;
    nameIndex: number;
}
export interface StringConstant extends ConstantPoolEntry {
    tag: ConstantTag.String;
    stringIndex: number;
}
export interface FieldrefConstant extends ConstantPoolEntry {
    tag: ConstantTag.Fieldref;
    classIndex: number;
    nameAndTypeIndex: number;
}
export interface MethodrefConstant extends ConstantPoolEntry {
    tag: ConstantTag.Methodref;
    classIndex: number;
    nameAndTypeIndex: number;
}
export interface InterfaceMethodrefConstant extends ConstantPoolEntry {
    tag: ConstantTag.InterfaceMethodref;
    classIndex: number;
    nameAndTypeIndex: number;
}
export interface NameAndTypeConstant extends ConstantPoolEntry {
    tag: ConstantTag.NameAndType;
    nameIndex: number;
    descriptorIndex: number;
}
export type ConstantValue = Utf8Constant | IntegerConstant | FloatConstant | LongConstant | DoubleConstant | ClassConstant | StringConstant | FieldrefConstant | MethodrefConstant | InterfaceMethodrefConstant | NameAndTypeConstant;
export interface ResolvedClassRef {
    name: string;
}
export interface ResolvedFieldRef {
    className: string;
    fieldName: string;
    descriptor: string;
}
export interface ResolvedMethodRef {
    className: string;
    methodName: string;
    descriptor: string;
}
