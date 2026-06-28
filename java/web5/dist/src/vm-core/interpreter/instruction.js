"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instruction = exports.InstructionRegistry = void 0;
class InstructionRegistry {
    static register(opcode, handler) {
        this.handlers[opcode] = handler;
    }
    static get(opcode) {
        return this.handlers[opcode];
    }
}
exports.InstructionRegistry = InstructionRegistry;
InstructionRegistry.handlers = new Array(256).fill(null);
function Instruction(opcode) {
    return function (target, propertyKey, descriptor) {
        InstructionRegistry.register(opcode, descriptor.value);
    };
}
exports.Instruction = Instruction;
//# sourceMappingURL=instruction.js.map