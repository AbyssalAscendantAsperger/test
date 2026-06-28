import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class ControlInstructions {
    static return_void(frame: Frame, thread: Thread): void;
    static ireturn(frame: Frame, thread: Thread): void;
    static lreturn(frame: Frame, thread: Thread): void;
    static freturn(frame: Frame, thread: Thread): void;
    static dreturn(frame: Frame, thread: Thread): void;
    static areturn(frame: Frame, thread: Thread): void;
}
