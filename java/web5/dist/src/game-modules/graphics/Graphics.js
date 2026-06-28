"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graphics = void 0;
const Font_1 = require("./Font");
class Graphics {
    constructor(ctx, width, height) {
        this.color = 0x000000;
        this.translateX = 0;
        this.translateY = 0;
        this.clipX = 0;
        this.clipY = 0;
        this.ctx = ctx;
        this.clipWidth = width;
        this.clipHeight = height;
        this.font = Font_1.Font.getDefaultFont();
        this.ctx.save();
        this.updateFont();
    }
    setColor(red, green, blue) {
        this.color = ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF);
        this.updateCanvasColor();
    }
    setColorRGB(rgb) {
        this.color = rgb & 0xFFFFFF;
        this.updateCanvasColor();
    }
    getColor() {
        return this.color;
    }
    updateCanvasColor() {
        const r = (this.color >> 16) & 0xFF;
        const g = (this.color >> 8) & 0xFF;
        const b = this.color & 0xFF;
        const colorStr = `rgb(${r},${g},${b})`;
        this.ctx.fillStyle = colorStr;
        this.ctx.strokeStyle = colorStr;
    }
    setFont(font) {
        if (font) {
            this.font = font;
            this.updateFont();
        }
    }
    getFont() {
        return this.font;
    }
    updateFont() {
        if (this.font) {
            this.ctx.font = this.font._toCSS();
        }
    }
    translate(x, y) {
        this.translateX += x;
        this.translateY += y;
        this.ctx.translate(x, y);
    }
    getTranslateX() {
        return this.translateX;
    }
    getTranslateY() {
        return this.translateY;
    }
    setClip(x, y, width, height) {
        this.clipX = x;
        this.clipY = y;
        this.clipWidth = width;
        this.clipHeight = height;
        this.ctx.restore();
        this.ctx.save();
        this.ctx.translate(this.translateX, this.translateY);
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
        this.updateCanvasColor();
        this.updateFont();
    }
    getClipX() {
        return this.clipX;
    }
    getClipY() {
        return this.clipY;
    }
    getClipWidth() {
        return this.clipWidth;
    }
    getClipHeight() {
        return this.clipHeight;
    }
    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1 + 0.5, y1 + 0.5);
        this.ctx.lineTo(x2 + 0.5, y2 + 0.5);
        this.ctx.stroke();
    }
    drawRect(x, y, width, height) {
        this.ctx.strokeRect(x + 0.5, y + 0.5, width, height);
    }
    fillRect(x, y, width, height) {
        this.ctx.fillRect(x, y, width, height);
    }
    drawRoundRect(x, y, width, height, arcWidth, arcHeight) {
        const radiusX = arcWidth / 2;
        const radiusY = arcHeight / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + radiusX, y);
        this.ctx.lineTo(x + width - radiusX, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radiusY);
        this.ctx.lineTo(x + width, y + height - radiusY);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radiusX, y + height);
        this.ctx.lineTo(x + radiusX, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radiusY);
        this.ctx.lineTo(x, y + radiusY);
        this.ctx.quadraticCurveTo(x, y, x + radiusX, y);
        this.ctx.stroke();
    }
    fillRoundRect(x, y, width, height, arcWidth, arcHeight) {
        const radiusX = arcWidth / 2;
        const radiusY = arcHeight / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + radiusX, y);
        this.ctx.lineTo(x + width - radiusX, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radiusY);
        this.ctx.lineTo(x + width, y + height - radiusY);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radiusX, y + height);
        this.ctx.lineTo(x + radiusX, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radiusY);
        this.ctx.lineTo(x, y + radiusY);
        this.ctx.quadraticCurveTo(x, y, x + radiusX, y);
        this.ctx.fill();
    }
    drawArc(x, y, width, height, startAngle, arcAngle) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radiusX = width / 2;
        const radiusY = height / 2;
        const startRad = -startAngle * Math.PI / 180;
        const endRad = -(startAngle + arcAngle) * Math.PI / 180;
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, startRad, endRad, arcAngle < 0);
        this.ctx.stroke();
    }
    fillArc(x, y, width, height, startAngle, arcAngle) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radiusX = width / 2;
        const radiusY = height / 2;
        const startRad = -startAngle * Math.PI / 180;
        const endRad = -(startAngle + arcAngle) * Math.PI / 180;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, startRad, endRad, arcAngle < 0);
        this.ctx.closePath();
        this.ctx.fill();
    }
    drawString(str, x, y, anchor) {
        const pos = this.calculateAnchorPosition(str, x, y, anchor);
        this.ctx.fillText(str, pos.x, pos.y);
        if (this.font.isUnderlined()) {
            const width = this.font.stringWidth(str);
            const height = this.font.getHeight();
            this.ctx.fillRect(pos.x, pos.y + height - 2, width, 1);
        }
    }
    drawSubstring(str, offset, len, x, y, anchor) {
        const substr = str.substring(offset, offset + len);
        this.drawString(substr, x, y, anchor);
    }
    drawChar(char, x, y, anchor) {
        this.drawString(char, x, y, anchor);
    }
    drawChars(chars, offset, length, x, y, anchor) {
        const str = chars.slice(offset, offset + length).join('');
        this.drawString(str, x, y, anchor);
    }
    calculateAnchorPosition(str, x, y, anchor) {
        let posX = x;
        let posY = y;
        if (anchor & Graphics.HCENTER) {
            this.ctx.textAlign = 'center';
        }
        else if (anchor & Graphics.RIGHT) {
            this.ctx.textAlign = 'right';
        }
        else {
            this.ctx.textAlign = 'left';
        }
        if (anchor & Graphics.VCENTER) {
            this.ctx.textBaseline = 'middle';
        }
        else if (anchor & Graphics.BOTTOM) {
            this.ctx.textBaseline = 'bottom';
        }
        else if (anchor & Graphics.BASELINE) {
            this.ctx.textBaseline = 'alphabetic';
        }
        else {
            this.ctx.textBaseline = 'top';
        }
        return { x: posX, y: posY };
    }
    drawImage(image, x, y, anchor) {
        if (!image)
            return;
        const imgElement = image._getElement();
        const width = image.getWidth();
        const height = image.getHeight();
        let dx = x;
        let dy = y;
        if (anchor & Graphics.HCENTER) {
            dx -= width / 2;
        }
        else if (anchor & Graphics.RIGHT) {
            dx -= width;
        }
        if (anchor & Graphics.VCENTER) {
            dy -= height / 2;
        }
        else if (anchor & Graphics.BOTTOM) {
            dy -= height;
        }
        this.ctx.drawImage(imgElement, dx, dy);
    }
    drawRegion(image, srcX, srcY, srcWidth, srcHeight, transform, dstX, dstY, anchor) {
        if (!image)
            return;
        const imgElement = image._getElement();
        let transWidth = srcWidth;
        let transHeight = srcHeight;
        if (transform === Graphics.TRANS_ROT90 || transform === Graphics.TRANS_ROT270 ||
            transform === Graphics.TRANS_MIRROR_ROT90 || transform === Graphics.TRANS_MIRROR_ROT270) {
            transWidth = srcHeight;
            transHeight = srcWidth;
        }
        let dx = dstX;
        let dy = dstY;
        if (anchor & Graphics.HCENTER) {
            dx -= transWidth / 2;
        }
        else if (anchor & Graphics.RIGHT) {
            dx -= transWidth;
        }
        if (anchor & Graphics.VCENTER) {
            dy -= transHeight / 2;
        }
        else if (anchor & Graphics.BOTTOM) {
            dy -= transHeight;
        }
        this.ctx.save();
        this.ctx.translate(dx + transWidth / 2, dy + transHeight / 2);
        switch (transform) {
            case Graphics.TRANS_ROT90:
                this.ctx.rotate(Math.PI / 2);
                break;
            case Graphics.TRANS_ROT180:
                this.ctx.rotate(Math.PI);
                break;
            case Graphics.TRANS_ROT270:
                this.ctx.rotate(-Math.PI / 2);
                break;
            case Graphics.TRANS_MIRROR:
                this.ctx.scale(-1, 1);
                break;
            case Graphics.TRANS_MIRROR_ROT90:
                this.ctx.scale(-1, 1);
                this.ctx.rotate(Math.PI / 2);
                break;
            case Graphics.TRANS_MIRROR_ROT180:
                this.ctx.scale(-1, 1);
                this.ctx.rotate(Math.PI);
                break;
            case Graphics.TRANS_MIRROR_ROT270:
                this.ctx.scale(-1, 1);
                this.ctx.rotate(-Math.PI / 2);
                break;
        }
        this.ctx.drawImage(imgElement, srcX, srcY, srcWidth, srcHeight, -srcWidth / 2, -srcHeight / 2, srcWidth, srcHeight);
        this.ctx.restore();
    }
    fillTriangle(x1, y1, x2, y2, x3, y3) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.closePath();
        this.ctx.fill();
    }
    copyArea(x, y, width, height, dx, dy, anchor) {
        const imageData = this.ctx.getImageData(x, y, width, height);
        this.ctx.putImageData(imageData, x + dx, y + dy);
    }
    dispose() {
        this.ctx.restore();
    }
}
exports.Graphics = Graphics;
Graphics.LEFT = 4;
Graphics.RIGHT = 8;
Graphics.TOP = 16;
Graphics.BOTTOM = 32;
Graphics.HCENTER = 1;
Graphics.VCENTER = 2;
Graphics.BASELINE = 64;
Graphics.TRANS_NONE = 0;
Graphics.TRANS_ROT90 = 5;
Graphics.TRANS_ROT180 = 3;
Graphics.TRANS_ROT270 = 6;
Graphics.TRANS_MIRROR = 2;
Graphics.TRANS_MIRROR_ROT90 = 7;
Graphics.TRANS_MIRROR_ROT180 = 1;
Graphics.TRANS_MIRROR_ROT270 = 4;
Graphics.SOLID = 0;
Graphics.DOTTED = 1;
//# sourceMappingURL=Graphics.js.map