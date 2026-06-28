import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class ConversionInstructions {
    static i2l(frame: Frame, thread: Thread): void;
    static i2f(frame: Frame, thread: Thread): void;
    static i2d(frame: Frame, thread: Thread): void;
    static l2i(frame: Frame, thread: Thread): void;
    static l2f(frame: Frame, thread: Thread): void;
    static l2d(frame: Frame, thread: Thread): void;
    static f2i(frame: Frame, thread: Thread): void;
    static f2l(frame: Frame, thread: Thread): void;
    static f2d(frame: Frame, thread: Thread): void;
    static d2i(frame: Frame, thread: Thread): void;
    static d2l(frame: Frame, thread: Thread): void;
    static d2f(frame: Frame, thread: Thread): void;
    static i2b(frame: Frame, thread: Thread): void;
    static i2c(frame: Frame, thread: Thread): void;
    static i2s(frame: Frame, thread: Thread): void;
}
