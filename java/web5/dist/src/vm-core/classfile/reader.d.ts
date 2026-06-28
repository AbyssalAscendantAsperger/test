export declare class ClassFileReader {
    private view;
    private offset;
    private readonly buffer;
    constructor(buffer: Uint8Array);
    readU1(): number;
    readU2(): number;
    readU4(): number;
    readI1(): number;
    readI2(): number;
    readI4(): number;
    readI8(): bigint;
    readFloat(): number;
    readDouble(): number;
    readUtf8Bytes(length: number): Uint8Array;
    readUtf8String(length: number): string;
    readBytes(length: number): Uint8Array;
    getOffset(): number;
    setOffset(offset: number): void;
    skip(bytes: number): void;
    hasRemaining(): boolean;
    remaining(): number;
    alignTo4(): void;
}
