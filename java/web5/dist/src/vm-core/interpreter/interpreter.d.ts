import { Thread } from "../threading/thread";
import { ExecutionStatus } from "../core/constants";
export interface ExceptionHandler {
    startPc: number;
    endPc: number;
    handlerPc: number;
    catchType: number | string;
}
export declare class Interpreter {
    static execute(thread: Thread): Generator<ExecutionStatus, void, void>;
    private static handleException;
    private static findExceptionHandler;
    static step(thread: Thread): void;
}
