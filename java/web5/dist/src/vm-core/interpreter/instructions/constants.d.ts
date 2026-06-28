import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
export declare class ConstantInstructions {
    static nop(frame: Frame, thread: Thread): void;
    static new(frame: Frame, thread: Thread): void;
    static iconst_m1(frame: Frame, thread: Thread): void;
    static iconst_0(frame: Frame, thread: Thread): void;
    static iconst_1(frame: Frame, thread: Thread): void;
    static iconst_2(frame: Frame, thread: Thread): void;
    static iconst_3(frame: Frame, thread: Thread): void;
    static iconst_4(frame: Frame, thread: Thread): void;
    static iconst_5(frame: Frame, thread: Thread): void;
    static lconst_0(frame: Frame, thread: Thread): void;
    static lconst_1(frame: Frame, thread: Thread): void;
    static fconst_0(frame: Frame, thread: Thread): void;
    static fconst_1(frame: Frame, thread: Thread): void;
    static fconst_2(frame: Frame, thread: Thread): void;
    static dconst_0(frame: Frame, thread: Thread): void;
    static dconst_1(frame: Frame, thread: Thread): void;
    static bipush(frame: Frame, thread: Thread): void;
    static sipush(frame: Frame, thread: Thread): void;
    static ldc(frame: Frame, thread: Thread): void;
    static ldc_w(frame: Frame, thread: Thread): void;
    static ldc2_w(frame: Frame, thread: Thread): void;
    private static pushConstant;
}
