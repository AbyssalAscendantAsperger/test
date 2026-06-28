"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Displayable = void 0;
class Displayable {
    constructor(width = 240, height = 320) {
        this.title = null;
        this.width = width;
        this.height = height;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    setTitle(title) {
        this.title = title;
    }
    getTitle() {
        return this.title;
    }
    sizeChanged(w, h) {
    }
}
exports.Displayable = Displayable;
//# sourceMappingURL=Displayable.js.map