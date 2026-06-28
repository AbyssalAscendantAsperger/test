import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class FieldInstructions {
    private static staticFieldCache;
    static getstatic(frame: Frame, thread: Thread): void;
    static putstatic(frame: Frame, thread: Thread): void;
    static getfield(frame: Frame, thread: Thread): void;
    static putfield(frame: Frame, thread: Thread): void;
    private static getClassStaticFields;
    private static getDefaultValue;
}
