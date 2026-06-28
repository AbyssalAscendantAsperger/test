import { Displayable } from './Displayable';
export declare class Display {
    private static instance;
    private currentDisplayable;
    private htmlCanvas;
    private constructor();
    static getDisplay(midlet: any): Display;
    setCurrent(displayable: Displayable | null): void;
    getCurrent(): Displayable | null;
    private showCanvas;
    private createHTMLCanvas;
    private bindEventListeners;
    private handleKeyDown;
    private handleKeyUp;
    private mapKeyCode;
    private handleMouseDown;
    private handleMouseUp;
    private handleMouseMove;
    private handleTouchStart;
    private handleTouchEnd;
    private handleTouchMove;
    callSerially(runnable: () => void): void;
    vibrate(duration: number): boolean;
    flashBacklight(duration: number): boolean;
    numColors(): number;
    isColor(): boolean;
    numAlphaLevels(): number;
}
