import { JarLoader } from '../loader/JarLoader';
export declare class Context {
    private static instance;
    private jarLoader;
    private constructor();
    static getInstance(): Context;
    getJarLoader(): JarLoader;
    setJarLoader(loader: JarLoader): void;
}
