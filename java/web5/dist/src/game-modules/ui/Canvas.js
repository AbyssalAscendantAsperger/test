"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Canvas = void 0;
const Displayable_1 = require("./Displayable");
const Graphics_1 = require("../graphics/Graphics");
class Canvas extends Displayable_1.Displayable {
    constructor() {
        super();
        this.htmlCanvas = null;
        this.ctx = null;
        this.repaintPending = false;
    }
    repaint() {
        if (this.repaintPending) {
            return;
        }
        this.repaintPending = true;
        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => this.performPaint());
        }
        else {
            setTimeout(() => this.performPaint(), 16);
        }
    }
    repaintRect(x, y, width, height) {
        this.repaint();
    }
    serviceRepaints() {
        if (this.repaintPending) {
            this.performPaint();
        }
    }
    performPaint() {
        if (!this.ctx) {
            return;
        }
        this.repaintPending = false;
        const g = new Graphics_1.Graphics(this.ctx, this.width, this.height);
        try {
            this.paint(g);
        }
        catch (error) {
            console.error('Error in Canvas.paint():', error);
        }
        finally {
            g.dispose();
        }
    }
    bindCanvas(canvas) {
        this.htmlCanvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (this.ctx) {
            this.ctx.font = '12px sans-serif';
        }
        canvas.width = this.width;
        canvas.height = this.height;
    }
    getGameAction(keyCode) {
        switch (keyCode) {
            case Canvas.KEY_NUM2:
                return Canvas.UP;
            case Canvas.KEY_NUM8:
                return Canvas.DOWN;
            case Canvas.KEY_NUM4:
                return Canvas.LEFT;
            case Canvas.KEY_NUM6:
                return Canvas.RIGHT;
            case Canvas.KEY_NUM5:
                return Canvas.FIRE;
            case Canvas.KEY_NUM7:
                return Canvas.GAME_A;
            case Canvas.KEY_NUM9:
                return Canvas.GAME_B;
            default:
                return 0;
        }
    }
    getKeyName(keyCode) {
        if (keyCode >= Canvas.KEY_NUM0 && keyCode <= Canvas.KEY_NUM9) {
            return String.fromCharCode(keyCode);
        }
        switch (keyCode) {
            case Canvas.KEY_STAR:
                return '*';
            case Canvas.KEY_POUND:
                return '#';
            default:
                return '';
        }
    }
    keyPressed(keyCode) {
    }
    keyReleased(keyCode) {
    }
    keyRepeated(keyCode) {
    }
    pointerPressed(x, y) {
    }
    pointerReleased(x, y) {
    }
    pointerDragged(x, y) {
    }
    showNotify() {
    }
    hideNotify() {
    }
    isDoubleBuffered() {
        return true;
    }
    hasPointerEvents() {
        return true;
    }
    hasPointerMotionEvents() {
        return true;
    }
    hasRepeatEvents() {
        return true;
    }
    _triggerKeyPressed(keyCode) {
        this.keyPressed(keyCode);
    }
    _triggerKeyReleased(keyCode) {
        this.keyReleased(keyCode);
    }
    _triggerKeyRepeated(keyCode) {
        this.keyRepeated(keyCode);
    }
    _triggerPointerPressed(x, y) {
        this.pointerPressed(x, y);
    }
    _triggerPointerReleased(x, y) {
        this.pointerReleased(x, y);
    }
    _triggerPointerDragged(x, y) {
        this.pointerDragged(x, y);
    }
}
exports.Canvas = Canvas;
Canvas.KEY_NUM0 = 48;
Canvas.KEY_NUM1 = 49;
Canvas.KEY_NUM2 = 50;
Canvas.KEY_NUM3 = 51;
Canvas.KEY_NUM4 = 52;
Canvas.KEY_NUM5 = 53;
Canvas.KEY_NUM6 = 54;
Canvas.KEY_NUM7 = 55;
Canvas.KEY_NUM8 = 56;
Canvas.KEY_NUM9 = 57;
Canvas.KEY_STAR = 42;
Canvas.KEY_POUND = 35;
Canvas.UP = 1;
Canvas.DOWN = 6;
Canvas.LEFT = 2;
Canvas.RIGHT = 5;
Canvas.FIRE = 8;
Canvas.GAME_A = 9;
Canvas.GAME_B = 10;
Canvas.GAME_C = 11;
Canvas.GAME_D = 12;
//# sourceMappingURL=Canvas.js.map