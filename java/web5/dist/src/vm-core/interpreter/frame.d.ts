import { MethodInfo } from "../classfile/method-info";
import { JavaValue } from "../core/types";
import { OperandStack } from "./stack";
import { JavaObject } from "../runtime/object";
export declare class Frame {
    readonly method: MethodInfo;
    readonly locals: JavaValue[];
    readonly stack: OperandStack;
    pc: number;
    nextPc: number;
    readonly prev: Frame | null;
    constructor(method: MethodInfo, prev?: Frame | null);
    setLocal(index: number, value: JavaValue): void;
    getLocal(index: number): JavaValue;
    getInt(index: number): number;
    getLong(index: number): bigint;
    getFloat(index: number): number;
    getDouble(index: number): number;
    getObject(index: number): JavaObject | null;
    toString(): string;
}
