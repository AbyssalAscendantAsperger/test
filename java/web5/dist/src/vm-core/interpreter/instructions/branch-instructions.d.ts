import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class BranchInstructions {
    static goto(frame: Frame, thread: Thread): void;
    static ifeq(frame: Frame, thread: Thread): void;
    static ifne(frame: Frame, thread: Thread): void;
    static iflt(frame: Frame, thread: Thread): void;
    static ifge(frame: Frame, thread: Thread): void;
    static ifgt(frame: Frame, thread: Thread): void;
    static ifle(frame: Frame, thread: Thread): void;
    static if_icmpeq(frame: Frame, thread: Thread): void;
    static if_icmpne(frame: Frame, thread: Thread): void;
    static if_icmplt(frame: Frame, thread: Thread): void;
    static if_icmpge(frame: Frame, thread: Thread): void;
    static if_icmpgt(frame: Frame, thread: Thread): void;
    static if_icmple(frame: Frame, thread: Thread): void;
    static if_acmpeq(frame: Frame, thread: Thread): void;
    static if_acmpne(frame: Frame, thread: Thread): void;
    static ifnull(frame: Frame, thread: Thread): void;
    static ifnonnull(frame: Frame, thread: Thread): void;
}
