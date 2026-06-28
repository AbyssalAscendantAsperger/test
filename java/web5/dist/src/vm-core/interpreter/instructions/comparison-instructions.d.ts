import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class ComparisonInstructions {
    static lcmp(frame: Frame, thread: Thread): void;
    static fcmpl(frame: Frame, thread: Thread): void;
    static fcmpg(frame: Frame, thread: Thread): void;
    static dcmpl(frame: Frame, thread: Thread): void;
    static dcmpg(frame: Frame, thread: Thread): void;
}
