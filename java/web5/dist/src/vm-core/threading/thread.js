"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadStatus = exports.Thread = void 0;
class Thread {
    constructor() {
        this.frames = [];
        this.status = ThreadStatus.RUNNABLE;
        this.waitingForNotify = false;
        this.id = Thread.nextId++;
    }
    pushFrame(frame) {
        this.frames.push(frame);
    }
    popFrame() {
        if (this.frames.length === 0) {
            throw new Error("StackUnderflowError: No frames to pop");
        }
        return this.frames.pop();
    }
    currentFrame() {
        if (this.frames.length === 0) {
            throw new Error("No current frame");
        }
        return this.frames[this.frames.length - 1];
    }
    hasFrames() {
        return this.frames.length > 0;
    }
    getStackDepth() {
        return this.frames.length;
    }
    toString() {
        return `Thread[${this.id}] ${this.status}`;
    }
}
exports.Thread = Thread;
Thread.nextId = 0;
var ThreadStatus;
(function (ThreadStatus) {
    ThreadStatus[ThreadStatus["NEW"] = 0] = "NEW";
    ThreadStatus[ThreadStatus["RUNNABLE"] = 1] = "RUNNABLE";
    ThreadStatus[ThreadStatus["BLOCKED"] = 2] = "BLOCKED";
    ThreadStatus[ThreadStatus["WAITING"] = 3] = "WAITING";
    ThreadStatus[ThreadStatus["TIMED_WAITING"] = 4] = "TIMED_WAITING";
    ThreadStatus[ThreadStatus["TERMINATED"] = 5] = "TERMINATED";
})(ThreadStatus = exports.ThreadStatus || (exports.ThreadStatus = {}));
//# sourceMappingURL=thread.js.map