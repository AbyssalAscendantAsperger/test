import { ClassPath } from "../../vm-core/classfile/class-loader";
import { JarLoader } from "./JarLoader";
export declare class JarClassPath implements ClassPath {
    private loader;
    constructor(loader: JarLoader);
    readClass(className: string): Uint8Array | null;
}
