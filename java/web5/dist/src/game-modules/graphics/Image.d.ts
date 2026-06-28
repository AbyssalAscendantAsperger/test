import { Graphics } from './Graphics';
export declare class Image {
    private element;
    private mutable;
    private graphics;
    private constructor();
    static createImage(width: number, height: number): Image;
    static createImageFromPath(path: string): Image;
    getWidth(): number;
    getHeight(): number;
    getGraphics(): Graphics;
    isMutable(): boolean;
    _getElement(): HTMLImageElement | HTMLCanvasElement;
    getRGB(rgbData: Int32Array, offset: number, scanlength: number, x: number, y: number, width: number, height: number): void;
}
