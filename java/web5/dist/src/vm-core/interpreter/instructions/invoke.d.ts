import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class InvokeInstructions {
    private static invokeMethod;
    static invokespecial(frame: Frame, thread: Thread): void;
    static invokevirtual(frame: Frame, thread: Thread): void;
    static invokestatic(frame: Frame, thread: Thread): void;
}
