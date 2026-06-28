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

import { JarLoader } from "../loader/JarLoader";
import { Context } from "../context/Context";
import { JarClassPath } from "../loader/JarClassPath";
import { ClassLoader } from "../../vm-core/classfile/class-loader";
import { SystemClassPath } from "../../vm-core/classfile/system-class-path";
import { initInstructions } from "../../vm-core/interpreter/instructions";

export interface GameConfig {
    jarUrl?: string;
    jarData?: ArrayBuffer;
    mainClass?: string;
    screenSize?: string;
}

/**
 * 游戏启动器
 * 负责加载 JAR、解析配置、初始化 VM 并启动游戏
 */
export class Launcher {
    private config: GameConfig;
    private loader: JarLoader;

    constructor(config: GameConfig) {
        this.config = config;
        this.loader = new JarLoader();
        // 初始化 JVM 指令集，确保装饰器正确注册所有操作码
        initInstructions();
    }

    /**
     * 加载游戏资源
     */
    public async load(): Promise<void> {
        // 1. 加载 JAR
        if (this.config.jarData) {
            await this.loader.loadJar(this.config.jarData);
        } else if (this.config.jarUrl) {
             // 简单 fetch 实现
             if (typeof fetch !== 'undefined') {
                 const response = await fetch(this.config.jarUrl);
                 const buffer = await response.arrayBuffer();
                 await this.loader.loadJar(buffer);
             } else {
                 throw new Error("Fetch not available in this environment");
             }
        } else {
            throw new Error("No JAR provided");
        }

        // 2. 设置全局 Context
        Context.getInstance().setJarLoader(this.loader);
        
        // 3. 检查 MTK 特征
        if (this.loader.fileExists('ArmData.bin')) {
            console.warn("⚠️ Detected ArmData.bin (MTK Hybrid Game). ARM code will be ignored.");
        }
    }
    
    /**
     * 获取主类名
     */
    public getMainClassName(): string | null {
        // 1. 配置优先 (支持伪 JAR)
        if (this.config.mainClass) {
            return this.config.mainClass;
        }
        
        // 2. 解析 Manifest
        const manifestPaths = ['META-INF/MANIFEST.MF', 'meta-inf/manifest.mf', 'META-INF/manifest.mf', 'meta-inf/MANIFEST.MF'];
        let data = null;
        for (const p of manifestPaths) {
            if (this.loader.fileExists(p)) {
                data = this.loader.getFile(p);
                break;
            }
        }
        if (data) {
            let text = new TextDecoder().decode(data);
            // 展开折行的 Manifest 数据
            text = text.replace(/\r\n[ \t]|\n[ \t]|\r[ \t]/g, '');
            // 简单的正则匹配 MIDlet-1: Name, Icon, Class (忽略大小写)
            const match = text.match(/MIDlet-1:\s*[^,]+,\s*[^,]*,\s*(\S+)/i);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return null;
    }

    /**
     * 启动游戏
     */
    public start(): void {
        const mainClass = this.getMainClassName();
        if (!mainClass) {
            throw new Error("Could not determine main class");
        }
        console.log(`Launcher: Starting ${mainClass}...`);
        
        // 4. 初始化 ClassLoader（使用 SystemClassPath）
        const systemClassPath = new SystemClassPath();
        const jarClassPath = new JarClassPath(this.loader);
        const classLoader = new ClassLoader(jarClassPath, systemClassPath);
        
        try {
            // 加载主类
            const classInfo = classLoader.loadClass(mainClass);
            console.log(`✅ Main class loaded: ${classInfo.thisClass}`);
            console.log(`   Extends: ${classInfo.superClass || 'none'}`);
            
            // 导入 VMExecutor
            const { VMExecutor } = require('../../vm-core/vm-executor');
            const executor = new VMExecutor(classLoader);
            
            // 5. 创建 MIDlet 实例
            console.log(`\n🎮 Creating MIDlet instance...`);
            const midletInstance = executor.createInstance(mainClass);
            console.log(`✅ MIDlet instance created: ${midletInstance.toString()}`);
            
            // 6. 调用构造函数
            console.log(`\n🔧 Calling constructor...`);
            try {
                executor.invokeConstructor(midletInstance, "()V");
                console.log(`✅ Constructor executed successfully`);
            } catch (e) {
                console.error(`❌ Constructor failed: ${e}`);
                // 构造函数失败可能是因为没有无参构造函数，继续尝试
            }
            
            // 7. 调用 startApp()
            console.log(`\n🚀 Calling startApp()...`);
            try {
                executor.invokeInstanceMethod(midletInstance, "startApp", "()V");
                console.log(`✅ startApp() executed successfully`);
                console.log(`\n🎉 MIDlet started successfully!`);
            } catch (e) {
                console.error(`❌ startApp() failed: ${e}`);
                throw e;
            }
            
        } catch (e) {
            console.error(`❌ Failed to start MIDlet: ${e}`);
            if (e instanceof Error) {
                console.error(e.stack);
            }
            throw e;
        }
    }
}
