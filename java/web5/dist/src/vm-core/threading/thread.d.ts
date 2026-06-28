import { Frame } from "../interpreter/frame";
export declare class Thread {
    private frames;
    readonly id: number;
    private static nextId;
    status: ThreadStatus;
    waitingForNotify: boolean;
    constructor();
    pushFrame(frame: Frame): void;
    popFrame(): Frame;
    currentFrame(): Frame;
    hasFrames(): boolean;
    getStackDepth(): number;
    toString(): string;
}
export declare enum ThreadStatus {
    NEW = 0,
    RUNNABLE = 1,
    BLOCKED = 2,
    WAITING = 3,
    TIMED_WAITING = 4,
    TERMINATED = 5
}
