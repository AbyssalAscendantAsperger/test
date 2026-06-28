"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassFileReader = void 0;
class ClassFileReader {
    constructor(buffer) {
        this.offset = 0;
        this.buffer = buffer;
        this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
    readU1() {
        const value = this.view.getUint8(this.offset);
        this.offset += 1;
        return value;
    }
    readU2() {
        const value = this.view.getUint16(this.offset, false);
        this.offset += 2;
        return value;
    }
    readU4() {
        const value = this.view.getUint32(this.offset, false);
        this.offset += 4;
        return value;
    }
    readI1() {
        const value = this.view.getInt8(this.offset);
        this.offset += 1;
        return value;
    }
    readI2() {
        const value = this.view.getInt16(this.offset, false);
        this.offset += 2;
        return value;
    }
    readI4() {
        const value = this.view.getInt32(this.offset, false);
        this.offset += 4;
        return value;
    }
    readI8() {
        const value = this.view.getBigInt64(this.offset, false);
        this.offset += 8;
        return value;
    }
    readFloat() {
        const value = this.view.getFloat32(this.offset, false);
        this.offset += 4;
        return value;
    }
    readDouble() {
        const value = this.view.getFloat64(this.offset, false);
        this.offset += 8;
        return value;
    }
    readUtf8Bytes(length) {
        const bytes = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length);
        this.offset += length;
        return bytes;
    }
    readUtf8String(length) {
        const bytes = this.readUtf8Bytes(length);
        return new TextDecoder("utf-8").decode(bytes);
    }
    readBytes(length) {
        const bytes = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length);
        this.offset += length;
        return bytes;
    }
    getOffset() {
        return this.offset;
    }
    setOffset(offset) {
        if (offset < 0 || offset > this.buffer.length) {
            throw new Error(`Invalid offset: ${offset}`);
        }
        this.offset = offset;
    }
    skip(bytes) {
        this.offset += bytes;
    }
    hasRemaining() {
        return this.offset < this.buffer.length;
    }
    remaining() {
        return this.buffer.length - this.offset;
    }
    alignTo4() {
        const padding = (4 - (this.offset % 4)) % 4;
        this.offset += padding;
    }
}
exports.ClassFileReader = ClassFileReader;
//# sourceMappingURL=reader.js.map