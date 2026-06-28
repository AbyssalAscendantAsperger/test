/*
 * Copyright (C) 2025 Lingfeng <3374080053@qq.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { Opcode } from "../../bytecode/opcodes";
import { Instruction } from "../instruction";
import { Frame } from "../frame";
import { Thread } from "../../threading/thread";
import { ClassLoader } from "../../classfile/class-loader";
import { JavaObject } from "../../runtime/object";
import { ConstantTag } from "../../core/constants";

export class ConstantInstructions {
  @Instruction(Opcode.NOP)
  static nop(frame: Frame, thread: Thread): void {
    frame.pc++;
  }

  @Instruction(Opcode.NEW)
  static new(frame: Frame, thread: Thread): void {
    const code = frame.method.getCode()!;
    const index = (code.code[frame.pc + 1] << 8) | code.code[frame.pc + 2];
    
    // 从常量池解析类引用
    const className = frame.method.classInfo.constantPool.getClassName(index);
    
    // 从 thread 获取 classLoader
    const classLoader = (thread as any).classLoader;
    if (!classLoader) {
      throw new Error("ClassLoader not available in thread");
    }
    
    // 加载类
    const classInfo = classLoader.loadClass(className);
    
    // 创建对象实例
    const object = new JavaObject(classInfo);
    
    // 将对象引用压入栈
    frame.stack.push(object);
    
    // 更新 PC
    frame.pc += 3;
  }

  @Instruction(Opcode.ICONST_M1)
  static iconst_m1(frame: Frame, thread: Thread): void {
    frame.stack.push(-1);
    frame.pc++;
  }

  @Instruction(Opcode.ICONST_0)
  static iconst_0(frame: Frame, thread: Thread): void {
    frame.stack.push(0);
    frame.pc++;
  }

  @Instruction(Opcode.ICONST_1)
  static iconst_1(frame: Frame, thread: Thread): void {
    frame.stack.push(1);
    frame.pc++;
  }

  @Instruction(Opcode.ICONST_2)
  static iconst_2(frame: Frame, thread: Thread): void {
    frame.stack.push(2);
    frame.pc++;
  }

  @Instruction(Opcode.ICONST_3)
  static iconst_3(frame: Frame, thread: Thread): void {
    frame.stack.push(3);
    frame.pc++;
  }

  @Instruction(Opcode.ICONST_4)
  static iconst_4(frame: Frame, thread: Thread): void {
    frame.stack.push(4);
    frame.pc++;
  }

  @Instruction(Opcode.ICONST_5)
  static iconst_5(frame: Frame, thread: Thread): void {
    frame.stack.push(5);
    frame.pc++;
  }

  @Instruction(Opcode.LCONST_0)
  static lconst_0(frame: Frame, thread: Thread): void {
    frame.stack.push(0n);
    frame.pc++;
  }

  @Instruction(Opcode.LCONST_1)
  static lconst_1(frame: Frame, thread: Thread): void {
    frame.stack.push(1n);
    frame.pc++;
  }

  @Instruction(Opcode.FCONST_0)
  static fconst_0(frame: Frame, thread: Thread): void {
    frame.stack.push(0.0);
    frame.pc++;
  }

  @Instruction(Opcode.FCONST_1)
  static fconst_1(frame: Frame, thread: Thread): void {
    frame.stack.push(1.0);
    frame.pc++;
  }

  @Instruction(Opcode.FCONST_2)
  static fconst_2(frame: Frame, thread: Thread): void {
    frame.stack.push(2.0);
    frame.pc++;
  }

  @Instruction(Opcode.DCONST_0)
  static dconst_0(frame: Frame, thread: Thread): void {
    frame.stack.push(0.0);
    frame.pc++;
  }

  @Instruction(Opcode.DCONST_1)
  static dconst_1(frame: Frame, thread: Thread): void {
    frame.stack.push(1.0);
    frame.pc++;
  }

  @Instruction(Opcode.BIPUSH)
  static bipush(frame: Frame, thread: Thread): void {
    const byte = frame.method.getCode()!.code[frame.pc + 1];
    // 符号扩展
    const value = (byte << 24) >> 24;
    frame.stack.push(value);
    frame.pc += 2;
  }

  @Instruction(Opcode.SIPUSH)
  static sipush(frame: Frame, thread: Thread): void {
    const code = frame.method.getCode()!.code;
    const b1 = code[frame.pc + 1];
    const b2 = code[frame.pc + 2];
    const shortVal = (b1 << 8) | b2;
    // 符号扩展
    const value = (shortVal << 16) >> 16;
    frame.stack.push(value);
    frame.pc += 3;
  }

  @Instruction(Opcode.LDC)
  static ldc(frame: Frame, thread: Thread): void {
    const code = frame.method.getCode()!.code;
    const index = code[frame.pc + 1];
    ConstantInstructions.pushConstant(frame, index);
    frame.pc += 2;
  }

  @Instruction(Opcode.LDC_W)
  static ldc_w(frame: Frame, thread: Thread): void {
    const code = frame.method.getCode()!.code;
    const b1 = code[frame.pc + 1];
    const b2 = code[frame.pc + 2];
    const index = (b1 << 8) | b2;
    ConstantInstructions.pushConstant(frame, index);
    frame.pc += 3;
  }

  @Instruction(Opcode.LDC2_W)
  static ldc2_w(frame: Frame, thread: Thread): void {
    const code = frame.method.getCode()!.code;
    const b1 = code[frame.pc + 1];
    const b2 = code[frame.pc + 2];
    const index = (b1 << 8) | b2;
    ConstantInstructions.pushConstant(frame, index);
    frame.pc += 3;
  }

  private static pushConstant(frame: Frame, index: number): void {
    const cp = frame.method.classInfo.constantPool;
    const entry = cp.get(index);
    if (entry.tag === ConstantTag.Integer || entry.tag === ConstantTag.Float || entry.tag === ConstantTag.Long || entry.tag === ConstantTag.Double) {
      frame.stack.push((entry as any).value);
    } else if (entry.tag === ConstantTag.String) {
      frame.stack.push(cp.getString(index));
    } else if (entry.tag === ConstantTag.Class) {
      frame.stack.push(cp.getClassName(index));
    } else {
      throw new Error(`Unsupported LDC constant pool tag: ${entry.tag}`);
    }
  }
}
