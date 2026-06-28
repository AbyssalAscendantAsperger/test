import { Thread } from "./thread";
export declare class Scheduler {
    private runnableThreads;
    private waitingThreads;
    private blockedThreads;
    private threadGenerators;
    private static instance;
    private constructor();
    static getInstance(): Scheduler;
    addThread(thread: Thread): void;
    run(timeSlice?: number): Promise<void>;
    notify(threadId: number): void;
    notifyAll(): void;
    unblock(threadId: number): void;
    getRunnableThreadCount(): number;
    getWaitingThreadCount(): number;
    getBlockedThreadCount(): number;
    hasAliveThreads(): boolean;
    clear(): void;
}
