import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
import { JavaThrowable } from "../../runtime/throwable";
export declare class JavaException extends Error {
    readonly throwable: JavaThrowable;
    constructor(throwable: JavaThrowable);
}
export declare class ExceptionInstructions {
    static athrow(frame: Frame, thread: Thread): void;
}
