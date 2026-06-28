import { Frame } from "../interpreter/frame";
import { Thread } from "../threading/thread";
import { ExecutionStatus } from "../core/constants";
export type NativeMethodHandler = (frame: Frame, thread: Thread) => ExecutionStatus | void;
export declare class NativeRegistry {
    private static registry;
    static register(className: string, methodName: string, descriptor: string, handler: NativeMethodHandler): void;
    static get(className: string, methodName: string, descriptor: string): NativeMethodHandler | undefined;
    private static getKey;
}
