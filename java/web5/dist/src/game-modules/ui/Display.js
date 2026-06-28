"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Display = void 0;
const Canvas_1 = require("./Canvas");
class Display {
    constructor() {
        this.currentDisplayable = null;
        this.htmlCanvas = null;
    }
    static getDisplay(midlet) {
        if (!Display.instance) {
            Display.instance = new Display();
        }
        return Display.instance;
    }
    setCurrent(displayable) {
        if (this.currentDisplayable instanceof Canvas_1.Canvas) {
            this.currentDisplayable.hideNotify?.();
        }
        this.currentDisplayable = displayable;
        if (displayable instanceof Canvas_1.Canvas) {
            this.showCanvas(displayable);
        }
    }
    getCurrent() {
        return this.currentDisplayable;
    }
    showCanvas(canvas) {
        if (!this.htmlCanvas) {
            this.createHTMLCanvas();
        }
        if (this.htmlCanvas) {
            canvas.bindCanvas(this.htmlCanvas);
            canvas.showNotify?.();
            canvas.repaint();
        }
    }
    createHTMLCanvas() {
        let canvas = document.getElementById('display') || document.getElementById('j2me-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'display';
            canvas.style.border = '1px solid #000';
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
            document.body.appendChild(canvas);
        }
        this.htmlCanvas = canvas;
        this.bindEventListeners();
    }
    bindEventListeners() {
        if (!this.htmlCanvas) {
            return;
        }
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.htmlCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.htmlCanvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.htmlCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.htmlCanvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.htmlCanvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.htmlCanvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    }
    handleKeyDown(e) {
        if (!(this.currentDisplayable instanceof Canvas_1.Canvas)) {
            return;
        }
        const keyCode = this.mapKeyCode(e.key);
        if (keyCode !== 0) {
            e.preventDefault();
            this.currentDisplayable._triggerKeyPressed(keyCode);
        }
    }
    handleKeyUp(e) {
        if (!(this.currentDisplayable instanceof Canvas_1.Canvas)) {
            return;
        }
        const keyCode = this.mapKeyCode(e.key);
        if (keyCode !== 0) {
            e.preventDefault();
            this.currentDisplayable._triggerKeyReleased(keyCode);
        }
    }
    mapKeyCode(key) {
        const k = key.toLowerCase();
        switch (k) {
            case '0': return Canvas_1.Canvas.KEY_NUM0;
            case '1': return Canvas_1.Canvas.KEY_NUM1;
            case '2': return Canvas_1.Canvas.KEY_NUM2;
            case '3': return Canvas_1.Canvas.KEY_NUM3;
            case '4': return Canvas_1.Canvas.KEY_NUM4;
            case '5': return Canvas_1.Canvas.KEY_NUM5;
            case '6': return Canvas_1.Canvas.KEY_NUM6;
            case '7': return Canvas_1.Canvas.KEY_NUM7;
            case '8': return Canvas_1.Canvas.KEY_NUM8;
            case '9': return Canvas_1.Canvas.KEY_NUM9;
            case '*': return Canvas_1.Canvas.KEY_STAR;
            case '#': return Canvas_1.Canvas.KEY_POUND;
            case 'q': return -6;
            case 'w': return -7;
            case 'e': return Canvas_1.Canvas.KEY_STAR;
            case 'r': return Canvas_1.Canvas.KEY_POUND;
            case 'arrowup': return Canvas_1.Canvas.KEY_NUM2;
            case 'arrowdown': return Canvas_1.Canvas.KEY_NUM8;
            case 'arrowleft': return Canvas_1.Canvas.KEY_NUM4;
            case 'arrowright': return Canvas_1.Canvas.KEY_NUM6;
            case 'enter': return Canvas_1.Canvas.KEY_NUM5;
            case ' ': return Canvas_1.Canvas.KEY_NUM5;
            case 'f1': return 122;
            case 'f2': return 99;
            case 'escape': return -7;
            default: return 0;
        }
    }
    handleMouseDown(e) {
        if (!(this.currentDisplayable instanceof Canvas_1.Canvas) || !this.htmlCanvas) {
            return;
        }
        const rect = this.htmlCanvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        this.currentDisplayable._triggerPointerPressed(x, y);
    }
    handleMouseUp(e) {
        if (!(this.currentDisplayable instanceof Canvas_1.Canvas) || !this.htmlCanvas) {
            return;
        }
        const rect = this.htmlCanvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        this.currentDisplayable._triggerPointerReleased(x, y);
    }
    handleMouseMove(e) {
        if (!(this.currentDisplayable instanceof Canvas_1.Canvas) || !this.htmlCanvas) {
            return;
        }
        if (e.buttons === 1) {
            const rect = this.htmlCanvas.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left);
            const y = Math.floor(e.clientY - rect.top);
            this.currentDisplayable._triggerPointerDragged(x, y);
        }
    }
    handleTouchStart(e) {
        if (!(this.currentDisplayable instanceof Canvas_1.Canvas) || !this.htmlCanvas) {
            return;
        }
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.htmlCanvas.getBoundingClientRect();
        const x = Math.floor(touch.clientX - rect.left);
        const y = Math.floor(touch.clientY - rect.top);
        this.currentDisplayable._triggerPointerPressed(x, y);
    }
    handleTouchEnd(e) {
        if (!(this.currentDisplayable instanceof Canvas_1.Canvas) || !this.htmlCanvas) {
            return;
        }
        e.preventDefault();
        const touch = e.changedTouches[0];
        const rect = this.htmlCanvas.getBoundingClientRect();
        const x = Math.floor(touch.clientX - rect.left);
        const y = Math.floor(touch.clientY - rect.top);
        this.currentDisplayable._triggerPointerReleased(x, y);
    }
    handleTouchMove(e) {
        if (!(this.currentDisplayable instanceof Canvas_1.Canvas) || !this.htmlCanvas) {
            return;
        }
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.htmlCanvas.getBoundingClientRect();
        const x = Math.floor(touch.clientX - rect.left);
        const y = Math.floor(touch.clientY - rect.top);
        this.currentDisplayable._triggerPointerDragged(x, y);
    }
    callSerially(runnable) {
        setTimeout(runnable, 0);
    }
    vibrate(duration) {
        console.warn('Display.vibrate() not supported in web environment');
        return false;
    }
    flashBacklight(duration) {
        console.warn('Display.flashBacklight() not supported in web environment');
        return false;
    }
    numColors() {
        return 16777216;
    }
    isColor() {
        return true;
    }
    numAlphaLevels() {
        return 256;
    }
}
exports.Display = Display;
Display.instance = null;
//# sourceMappingURL=Display.js.map