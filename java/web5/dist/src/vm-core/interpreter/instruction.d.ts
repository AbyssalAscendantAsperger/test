import { Frame } from "./frame";
import { Thread } from "../threading/thread";
export type InstructionHandler = (frame: Frame, thread: Thread) => void;
export declare class InstructionRegistry {
    private static handlers;
    static register(opcode: number, handler: InstructionHandler): void;
    static get(opcode: number): InstructionHandler;
}
export declare function Instruction(opcode: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
