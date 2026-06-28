"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Font = void 0;
class Font {
    constructor(face, style, size) {
        this.metrics = null;
        this.face = face;
        this.style = style;
        this.size = size;
        this.cssString = this.computeCSS();
        this.height = this.computeHeight();
    }
    static getFont(face, style, size) {
        return new Font(face, style, size);
    }
    static getDefaultFont() {
        if (!Font.defaultFont) {
            Font.defaultFont = new Font(Font.FACE_SYSTEM, Font.STYLE_PLAIN, Font.SIZE_MEDIUM);
        }
        return Font.defaultFont;
    }
    getStyle() {
        return this.style;
    }
    getSize() {
        return this.size;
    }
    getFace() {
        return this.face;
    }
    isBold() {
        return (this.style & Font.STYLE_BOLD) !== 0;
    }
    isItalic() {
        return (this.style & Font.STYLE_ITALIC) !== 0;
    }
    isUnderlined() {
        return (this.style & Font.STYLE_UNDERLINED) !== 0;
    }
    getHeight() {
        return this.height;
    }
    getBaselinePosition() {
        return Math.ceil(this.height * 0.8);
    }
    stringWidth(str) {
        if (typeof document === 'undefined') {
            return str.length * 8;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.font = this.cssString;
            return Math.ceil(ctx.measureText(str).width);
        }
        return 0;
    }
    _toCSS() {
        return this.cssString;
    }
    computeCSS() {
        let css = "";
        if (this.style & Font.STYLE_ITALIC) {
            css += "italic ";
        }
        if (this.style & Font.STYLE_BOLD) {
            css += "bold ";
        }
        let pxSize = 12;
        if (this.size === Font.SIZE_SMALL) {
            pxSize = 10;
        }
        else if (this.size === Font.SIZE_LARGE) {
            pxSize = 16;
        }
        css += `${pxSize}px `;
        if (this.face === Font.FACE_MONOSPACE) {
            css += "monospace";
        }
        else {
            css += "sans-serif";
        }
        return css;
    }
    computeHeight() {
        if (this.size === Font.SIZE_SMALL) {
            return 12;
        }
        else if (this.size === Font.SIZE_LARGE) {
            return 20;
        }
        else {
            return 16;
        }
    }
}
exports.Font = Font;
Font.STYLE_PLAIN = 0;
Font.STYLE_BOLD = 1;
Font.STYLE_ITALIC = 2;
Font.STYLE_UNDERLINED = 4;
Font.SIZE_SMALL = 8;
Font.SIZE_MEDIUM = 0;
Font.SIZE_LARGE = 16;
Font.FACE_SYSTEM = 0;
Font.FACE_MONOSPACE = 32;
Font.FACE_PROPORTIONAL = 64;
Font.defaultFont = null;
//# sourceMappingURL=Font.js.map