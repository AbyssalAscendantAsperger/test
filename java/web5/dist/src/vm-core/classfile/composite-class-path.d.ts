import { ClassPath } from "./class-loader";
export declare class CompositeClassPath implements ClassPath {
    private classPaths;
    constructor(...classPaths: ClassPath[]);
    addClassPath(classPath: ClassPath): void;
    insertClassPath(index: number, classPath: ClassPath): void;
    removeClassPath(classPath: ClassPath): boolean;
    getClassPathCount(): number;
    readClass(className: string): Uint8Array | null;
    clear(): void;
}
