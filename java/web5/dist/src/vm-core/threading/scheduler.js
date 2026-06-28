"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const thread_1 = require("./thread");
const interpreter_1 = require("../interpreter/interpreter");
const constants_1 = require("../core/constants");
class Scheduler {
    constructor() {
        this.runnableThreads = [];
        this.waitingThreads = new Map();
        this.blockedThreads = new Map();
        this.threadGenerators = new Map();
    }
    static getInstance() {
        if (!Scheduler.instance) {
            Scheduler.instance = new Scheduler();
        }
        return Scheduler.instance;
    }
    addThread(thread) {
        if (thread.status === thread_1.ThreadStatus.RUNNABLE) {
            this.runnableThreads.push(thread);
            const generator = interpreter_1.Interpreter.execute(thread);
            this.threadGenerators.set(thread.id, generator);
        }
    }
    async run(timeSlice = 100) {
        const startTime = Date.now();
        while (this.runnableThreads.length > 0 && Date.now() - startTime < timeSlice) {
            const thread = this.runnableThreads.shift();
            if (thread.status !== thread_1.ThreadStatus.RUNNABLE) {
                continue;
            }
            const generator = this.threadGenerators.get(thread.id);
            if (!generator) {
                console.error(`No generator found for thread ${thread.id}`);
                continue;
            }
            try {
                const result = generator.next();
                if (result.done) {
                    thread.status = thread_1.ThreadStatus.TERMINATED;
                    this.threadGenerators.delete(thread.id);
                    continue;
                }
                const status = result.value;
                switch (status) {
                    case constants_1.ExecutionStatus.RUNNING:
                        this.runnableThreads.push(thread);
                        break;
                    case constants_1.ExecutionStatus.PAUSED:
                        thread.status = thread_1.ThreadStatus.TIMED_WAITING;
                        setTimeout(() => {
                            thread.status = thread_1.ThreadStatus.RUNNABLE;
                            this.runnableThreads.push(thread);
                        }, 0);
                        break;
                    case constants_1.ExecutionStatus.BLOCKED:
                        thread.status = thread_1.ThreadStatus.BLOCKED;
                        this.blockedThreads.set(thread.id, thread);
                        break;
                    case constants_1.ExecutionStatus.WAITING:
                    case constants_1.ExecutionStatus.TIMED_WAITING:
                        thread.status = status === constants_1.ExecutionStatus.WAITING
                            ? thread_1.ThreadStatus.WAITING
                            : thread_1.ThreadStatus.TIMED_WAITING;
                        this.waitingThreads.set(thread.id, thread);
                        break;
                    case constants_1.ExecutionStatus.TERMINATED:
                        thread.status = thread_1.ThreadStatus.TERMINATED;
                        this.threadGenerators.delete(thread.id);
                        break;
                }
            }
            catch (e) {
                console.error(`Error in thread ${thread.id}:`, e);
                thread.status = thread_1.ThreadStatus.TERMINATED;
                this.threadGenerators.delete(thread.id);
            }
        }
    }
    notify(threadId) {
        const thread = this.waitingThreads.get(threadId);
        if (thread) {
            this.waitingThreads.delete(threadId);
            thread.status = thread_1.ThreadStatus.RUNNABLE;
            this.runnableThreads.push(thread);
        }
    }
    notifyAll() {
        for (const [threadId, thread] of this.waitingThreads) {
            thread.status = thread_1.ThreadStatus.RUNNABLE;
            this.runnableThreads.push(thread);
        }
        this.waitingThreads.clear();
    }
    unblock(threadId) {
        const thread = this.blockedThreads.get(threadId);
        if (thread) {
            this.blockedThreads.delete(threadId);
            thread.status = thread_1.ThreadStatus.RUNNABLE;
            this.runnableThreads.push(thread);
        }
    }
    getRunnableThreadCount() {
        return this.runnableThreads.length;
    }
    getWaitingThreadCount() {
        return this.waitingThreads.size;
    }
    getBlockedThreadCount() {
        return this.blockedThreads.size;
    }
    hasAliveThreads() {
        return this.runnableThreads.length > 0 ||
            this.waitingThreads.size > 0 ||
            this.blockedThreads.size > 0;
    }
    clear() {
        this.runnableThreads = [];
        this.waitingThreads.clear();
        this.blockedThreads.clear();
        this.threadGenerators.clear();
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map