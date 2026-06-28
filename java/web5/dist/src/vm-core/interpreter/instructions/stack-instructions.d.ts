import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class StackInstructions {
    static pop(frame: Frame, thread: Thread): void;
    static pop2(frame: Frame, thread: Thread): void;
    static dup(frame: Frame, thread: Thread): void;
    static dup_x1(frame: Frame, thread: Thread): void;
    static dup_x2(frame: Frame, thread: Thread): void;
    static dup2(frame: Frame, thread: Thread): void;
    static dup2_x1(frame: Frame, thread: Thread): void;
    static dup2_x2(frame: Frame, thread: Thread): void;
    static swap(frame: Frame, thread: Thread): void;
}
