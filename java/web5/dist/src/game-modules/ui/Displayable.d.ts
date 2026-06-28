export declare abstract class Displayable {
    protected width: number;
    protected height: number;
    protected title: string | null;
    constructor(width?: number, height?: number);
    getWidth(): number;
    getHeight(): number;
    setTitle(title: string | null): void;
    getTitle(): string | null;
    protected sizeChanged(w: number, h: number): void;
}
