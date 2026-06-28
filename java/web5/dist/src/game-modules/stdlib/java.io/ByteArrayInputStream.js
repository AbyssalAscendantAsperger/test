"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteArrayInputStream = void 0;
const InputStream_1 = require("./InputStream");
class ByteArrayInputStream extends InputStream_1.InputStream {
    constructor(buf) {
        super();
        this.markPos = 0;
        this.buf = buf;
        this.pos = 0;
        this.count = buf.length;
    }
    read() {
        return (this.pos < this.count) ? (this.buf[this.pos++] & 0xff) : -1;
    }
    readBytesOffset(b, off, len) {
        if (b == null) {
            throw new Error("NullPointerException");
        }
        else if (off < 0 || len < 0 || len > b.length - off) {
            throw new Error("IndexOutOfBoundsException");
        }
        if (this.pos >= this.count) {
            return -1;
        }
        let avail = this.count - this.pos;
        if (len > avail) {
            len = avail;
        }
        if (len <= 0) {
            return 0;
        }
        for (let i = 0; i < len; i++) {
            b[off + i] = this.buf[this.pos + i];
        }
        this.pos += len;
        return len;
    }
    available() {
        return this.count - this.pos;
    }
    close() {
    }
}
exports.ByteArrayInputStream = ByteArrayInputStream;
//# sourceMappingURL=ByteArrayInputStream.js.map