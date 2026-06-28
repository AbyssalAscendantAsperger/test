import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class MathInstructions {
    static iadd(frame: Frame, thread: Thread): void;
    static isub(frame: Frame, thread: Thread): void;
    static imul(frame: Frame, thread: Thread): void;
    static idiv(frame: Frame, thread: Thread): void;
    static irem(frame: Frame, thread: Thread): void;
    static ineg(frame: Frame, thread: Thread): void;
    static ishl(frame: Frame, thread: Thread): void;
    static ishr(frame: Frame, thread: Thread): void;
    static iushr(frame: Frame, thread: Thread): void;
    static iand(frame: Frame, thread: Thread): void;
    static ior(frame: Frame, thread: Thread): void;
    static ixor(frame: Frame, thread: Thread): void;
    static ladd(frame: Frame, thread: Thread): void;
    static lsub(frame: Frame, thread: Thread): void;
    static lmul(frame: Frame, thread: Thread): void;
    static ldiv(frame: Frame, thread: Thread): void;
    static lrem(frame: Frame, thread: Thread): void;
    static lneg(frame: Frame, thread: Thread): void;
    static lshl(frame: Frame, thread: Thread): void;
    static lshr(frame: Frame, thread: Thread): void;
    static lushr(frame: Frame, thread: Thread): void;
    static land(frame: Frame, thread: Thread): void;
    static lor(frame: Frame, thread: Thread): void;
    static lxor(frame: Frame, thread: Thread): void;
}
