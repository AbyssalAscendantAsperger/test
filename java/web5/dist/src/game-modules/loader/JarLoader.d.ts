import { Image } from '../graphics/Image';
export declare class JarLoader {
    private files;
    private loaded;
    loadJar(data: ArrayBuffer): Promise<void>;
    getFile(path: string): Uint8Array | null;
    fileExists(path: string): boolean;
    loadImage(path: string): Image | null;
    private normalizePath;
    private getMimeType;
}
