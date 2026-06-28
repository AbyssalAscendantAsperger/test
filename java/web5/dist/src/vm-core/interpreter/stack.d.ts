import { JavaValue } from "../core/types";
export declare class OperandStack {
    private stack;
    private sp;
    constructor(maxStack: number);
    push(value: JavaValue): void;
    pop(): JavaValue;
    popInt(): number;
    popFloat(): number;
    popLong(): bigint;
    popDouble(): number;
    popRef(): JavaValue;
    pushLong(value: bigint): void;
    pushDouble(value: number): void;
    peek(offset?: number): JavaValue;
    size(): number;
    clear(): void;
    toString(): string;
}
