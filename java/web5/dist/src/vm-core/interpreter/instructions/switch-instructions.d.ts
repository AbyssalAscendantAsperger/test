import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class SwitchInstructions {
    static tableswitch(frame: Frame, thread: Thread): void;
    static lookupswitch(frame: Frame, thread: Thread): void;
    private static readInt32;
}
