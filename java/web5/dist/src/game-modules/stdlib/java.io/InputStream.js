"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputStream = void 0;
class InputStream {
    read() {
        return -1;
    }
    readBytes(b) {
        return this.readBytesOffset(b, 0, b.length);
    }
    readBytesOffset(b, off, len) {
        if (b == null) {
            throw new Error("NullPointerException");
        }
        else if (off < 0 || len < 0 || len > b.length - off) {
            throw new Error("IndexOutOfBoundsException");
        }
        else if (len == 0) {
            return 0;
        }
        let c = this.read();
        if (c == -1) {
            return -1;
        }
        b[off] = c;
        let i = 1;
        try {
            for (; i < len; i++) {
                c = this.read();
                if (c == -1) {
                    break;
                }
                b[off + i] = c;
            }
        }
        catch (ee) {
        }
        return i;
    }
    close() { }
    available() {
        return 0;
    }
}
exports.InputStream = InputStream;
//# sourceMappingURL=InputStream.js.map