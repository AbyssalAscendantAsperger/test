import { ClassInfo } from "./class-info";
import { SystemClassPath } from "./system-class-path";
export interface ClassPath {
    readClass(className: string): Uint8Array | null;
}
export declare class ClassLoader {
    private classes;
    private classPath;
    private systemClassPath?;
    constructor(classPath: ClassPath, systemClassPath?: SystemClassPath);
    loadClass(className: string): ClassInfo;
    private loadArrayClass;
    getClass(className: string): ClassInfo | undefined;
}
