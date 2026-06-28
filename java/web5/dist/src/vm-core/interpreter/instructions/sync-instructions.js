"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorManager = exports.SynchronizationInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
const object_1 = require("../../runtime/object");
class MonitorManager {
    static enter(obj) {
        const count = MonitorManager.monitors.get(obj) || 0;
        MonitorManager.monitors.set(obj, count + 1);
    }
    static exit(obj) {
        const count = MonitorManager.monitors.get(obj) || 0;
        if (count <= 0) {
            throw new Error("IllegalMonitorStateException: monitor not owned");
        }
        MonitorManager.monitors.set(obj, count - 1);
    }
    static getCount(obj) {
        return MonitorManager.monitors.get(obj) || 0;
    }
}
exports.MonitorManager = MonitorManager;
MonitorManager.monitors = new WeakMap();
class SynchronizationInstructions {
    static monitorenter(frame, thread) {
        const objectref = frame.stack.pop();
        if (objectref === null) {
            throw new Error("NullPointerException: Cannot enter monitor on null object");
        }
        if (!(objectref instanceof object_1.JavaObject)) {
            throw new Error("IllegalMonitorStateException: Not a valid object for synchronization");
        }
        MonitorManager.enter(objectref);
        frame.pc++;
    }
    static monitorexit(frame, thread) {
        const objectref = frame.stack.pop();
        if (objectref === null) {
            throw new Error("NullPointerException: Cannot exit monitor on null object");
        }
        if (!(objectref instanceof object_1.JavaObject)) {
            throw new Error("IllegalMonitorStateException: Not a valid object for synchronization");
        }
        MonitorManager.exit(objectref);
        frame.pc++;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.MONITORENTER)
], SynchronizationInstructions, "monitorenter", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.MONITOREXIT)
], SynchronizationInstructions, "monitorexit", null);
exports.SynchronizationInstructions = SynchronizationInstructions;
//# sourceMappingURL=sync-instructions.js.map