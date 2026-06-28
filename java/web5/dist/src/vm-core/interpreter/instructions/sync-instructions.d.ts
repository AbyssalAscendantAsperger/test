import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
import { JavaObject } from "../../runtime/object";
declare class MonitorManager {
    private static monitors;
    static enter(obj: JavaObject): void;
    static exit(obj: JavaObject): void;
    static getCount(obj: JavaObject): number;
}
export declare class SynchronizationInstructions {
    static monitorenter(frame: Frame, thread: Thread): void;
    static monitorexit(frame: Frame, thread: Thread): void;
}
export { MonitorManager };
