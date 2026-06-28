import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class ArrayInstructions {
    static newarray(frame: Frame, thread: Thread): void;
    static anewarray(frame: Frame, thread: Thread): void;
    static arraylength(frame: Frame, thread: Thread): void;
    static aaload(frame: Frame, thread: Thread): void;
    static aastore(frame: Frame, thread: Thread): void;
    static baload(frame: Frame, thread: Thread): void;
    static bastore(frame: Frame, thread: Thread): void;
    static caload(frame: Frame, thread: Thread): void;
    static castore(frame: Frame, thread: Thread): void;
    static saload(frame: Frame, thread: Thread): void;
    static sastore(frame: Frame, thread: Thread): void;
    static iaload(frame: Frame, thread: Thread): void;
    static iastore(frame: Frame, thread: Thread): void;
    static laload(frame: Frame, thread: Thread): void;
    static lastore(frame: Frame, thread: Thread): void;
    static faload(frame: Frame, thread: Thread): void;
    static fastore(frame: Frame, thread: Thread): void;
    static daload(frame: Frame, thread: Thread): void;
    static dastore(frame: Frame, thread: Thread): void;
    static multianewarray(frame: Frame, thread: Thread): void;
    private static createMultiArray;
    private static getArrayClassName;
    private static getObjectArrayClassName;
}
