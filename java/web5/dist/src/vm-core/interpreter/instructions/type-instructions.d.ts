import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class TypeInstructions {
    static instanceof_check(frame: Frame, thread: Thread): void;
    static checkcast(frame: Frame, thread: Thread): void;
    private static isInstanceOf;
    private static isClassCompatible;
}
