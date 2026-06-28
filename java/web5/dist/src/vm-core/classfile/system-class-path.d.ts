import { ClassPath } from "./class-loader";
import { ClassInfo } from "./class-info";
export declare class SystemClassPath implements ClassPath {
    private systemClasses;
    constructor();
    private initializeSystemClasses;
    private createSystemClass;
    readClass(className: string): Uint8Array | null;
    getSystemClass(className: string): ClassInfo | undefined;
    isSystemClass(className: string): boolean;
    getAllSystemClassNames(): string[];
}
