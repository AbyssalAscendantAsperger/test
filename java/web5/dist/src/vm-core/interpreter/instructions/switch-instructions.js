"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchInstructions = void 0;
const opcodes_1 = require("../../bytecode/opcodes");
const instruction_1 = require("../instruction");
class SwitchInstructions {
    static tableswitch(frame, thread) {
        const code = frame.method.getCode().code;
        const startPc = frame.pc;
        let pos = startPc + 1;
        const padding = (4 - (pos % 4)) % 4;
        pos += padding;
        const defaultOffset = SwitchInstructions.readInt32(code, pos);
        pos += 4;
        const low = SwitchInstructions.readInt32(code, pos);
        pos += 4;
        const high = SwitchInstructions.readInt32(code, pos);
        pos += 4;
        const index = frame.stack.popInt();
        let offset;
        if (index < low || index > high) {
            offset = defaultOffset;
        }
        else {
            const jumpTableIndex = index - low;
            const jumpOffset = SwitchInstructions.readInt32(code, pos + jumpTableIndex * 4);
            offset = jumpOffset;
        }
        frame.pc = startPc + offset;
    }
    static lookupswitch(frame, thread) {
        const code = frame.method.getCode().code;
        const startPc = frame.pc;
        let pos = startPc + 1;
        const padding = (4 - (pos % 4)) % 4;
        pos += padding;
        const defaultOffset = SwitchInstructions.readInt32(code, pos);
        pos += 4;
        const npairs = SwitchInstructions.readInt32(code, pos);
        pos += 4;
        const key = frame.stack.popInt();
        let offset = defaultOffset;
        for (let i = 0; i < npairs; i++) {
            const match = SwitchInstructions.readInt32(code, pos);
            pos += 4;
            const jumpOffset = SwitchInstructions.readInt32(code, pos);
            pos += 4;
            if (key === match) {
                offset = jumpOffset;
                break;
            }
        }
        frame.pc = startPc + offset;
    }
    static readInt32(bytes, offset) {
        const b1 = bytes[offset];
        const b2 = bytes[offset + 1];
        const b3 = bytes[offset + 2];
        const b4 = bytes[offset + 3];
        const value = (b1 << 24) | (b2 << 16) | (b3 << 8) | b4;
        return value | 0;
    }
}
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.TABLESWITCH)
], SwitchInstructions, "tableswitch", null);
__decorate([
    (0, instruction_1.Instruction)(opcodes_1.Opcode.LOOKUPSWITCH)
], SwitchInstructions, "lookupswitch", null);
exports.SwitchInstructions = SwitchInstructions;
//# sourceMappingURL=switch-instructions.js.map