import { JavaObject } from "./object";
import { JavaArray } from "./array";
export declare class JavaString extends JavaObject {
    private jsString;
    private charArray;
    constructor(classInfo: any, value: string);
    getValue(): string;
    getCharArray(): JavaArray;
    length(): number;
    charAt(index: number): number;
    concat(other: JavaString): JavaString;
    substring(beginIndex: number, endIndex?: number): JavaString;
    toLowerCase(): JavaString;
    toUpperCase(): JavaString;
    trim(): JavaString;
    equals(other: JavaString): boolean;
    compareTo(other: JavaString): number;
    startsWith(prefix: string): boolean;
    endsWith(suffix: string): boolean;
    indexOf(str: string, fromIndex?: number): number;
    toString(): string;
}
export declare class StringPool {
    private pool;
    intern(classInfo: any, value: string): JavaString;
    clear(): void;
    size(): number;
}
