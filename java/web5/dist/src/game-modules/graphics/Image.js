"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
const Graphics_1 = require("./Graphics");
const Context_1 = require("../context/Context");
class Image {
    constructor(element, mutable) {
        this.graphics = null;
        this.element = element;
        this.mutable = mutable;
    }
    static createImage(width, height) {
        if (width <= 0 || height <= 0) {
            throw new Error("IllegalArgumentException: Width and height must be positive");
        }
        if (typeof document === 'undefined') {
            return new Image({ width, height }, true);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return new Image(canvas, true);
    }
    static createImageFromPath(path) {
        const loader = Context_1.Context.getInstance().getJarLoader();
        if (loader && loader.fileExists(path)) {
            const img = loader.loadImage(path);
            if (img)
                return img;
        }
        if (typeof document === 'undefined') {
            return new Image({ width: 100, height: 100, src: path }, false);
        }
        const img = document.createElement('img');
        img.src = path;
        return new Image(img, false);
    }
    getWidth() {
        return this.element.width;
    }
    getHeight() {
        return this.element.height;
    }
    getGraphics() {
        if (!this.mutable) {
            throw new Error("IllegalStateException: Image is immutable");
        }
        if (!this.graphics) {
            if (typeof HTMLCanvasElement !== 'undefined' && this.element instanceof HTMLCanvasElement) {
                const ctx = this.element.getContext('2d');
                if (!ctx) {
                    throw new Error("Failed to get 2D context");
                }
                this.graphics = new Graphics_1.Graphics(ctx, this.element.width, this.element.height);
            }
            else if (typeof document === 'undefined') {
                this.graphics = {
                    setColor: () => { },
                    fillRect: () => { },
                    drawLine: () => { },
                    drawRect: () => { },
                    dispose: () => { }
                };
            }
            else {
                throw new Error("Mutable image must be backed by Canvas");
            }
        }
        return this.graphics;
    }
    isMutable() {
        return this.mutable;
    }
    _getElement() {
        return this.element;
    }
    getRGB(rgbData, offset, scanlength, x, y, width, height) {
        if (width <= 0 || height <= 0)
            return;
        let ctx = null;
        if (typeof HTMLCanvasElement !== 'undefined' && this.element instanceof HTMLCanvasElement) {
            ctx = this.element.getContext('2d');
        }
        else if (typeof HTMLImageElement !== 'undefined' && this.element instanceof HTMLImageElement) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            ctx = tempCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(this.element, -x, -y);
            }
        }
        if (!ctx)
            return;
        const imageData = ctx.getImageData(x, y, width, height);
        const data = imageData.data;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const idx = (i * width + j) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];
                const argb = (a << 24) | (r << 16) | (g << 8) | b;
                rgbData[offset + i * scanlength + j] = argb;
            }
        }
    }
}
exports.Image = Image;
//# sourceMappingURL=Image.js.map