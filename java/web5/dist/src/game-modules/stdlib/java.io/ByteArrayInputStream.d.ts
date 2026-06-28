import { InputStream } from './InputStream';
export declare class ByteArrayInputStream extends InputStream {
    protected buf: Uint8Array;
    protected pos: number;
    protected count: number;
    protected markPos: number;
    constructor(buf: Uint8Array);
    read(): number;
    readBytesOffset(b: Int8Array, off: number, len: number): number;
    available(): number;
    close(): void;
}
