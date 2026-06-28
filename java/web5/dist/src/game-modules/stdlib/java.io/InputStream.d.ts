export declare class InputStream {
    read(): number;
    readBytes(b: Int8Array): number;
    readBytesOffset(b: Int8Array, off: number, len: number): number;
    close(): void;
    available(): number;
}
