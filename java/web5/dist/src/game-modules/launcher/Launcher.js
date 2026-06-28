"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Launcher = void 0;
const JarLoader_1 = require("../loader/JarLoader");
const Context_1 = require("../context/Context");
const JarClassPath_1 = require("../loader/JarClassPath");
const class_loader_1 = require("../../vm-core/classfile/class-loader");
const system_class_path_1 = require("../../vm-core/classfile/system-class-path");
const instructions_1 = require("../../vm-core/interpreter/instructions");
class Launcher {
    constructor(config) {
        this.config = config;
        this.loader = new JarLoader_1.JarLoader();
        (0, instructions_1.initInstructions)();
    }
    async load() {
        if (this.config.jarData) {
            await this.loader.loadJar(this.config.jarData);
        }
        else if (this.config.jarUrl) {
            if (typeof fetch !== 'undefined') {
                const response = await fetch(this.config.jarUrl);
                const buffer = await response.arrayBuffer();
                await this.loader.loadJar(buffer);
            }
            else {
                throw new Error("Fetch not available in this environment");
            }
        }
        else {
            throw new Error("No JAR provided");
        }
        Context_1.Context.getInstance().setJarLoader(this.loader);
        if (this.loader.fileExists('ArmData.bin')) {
            console.warn("⚠️ Detected ArmData.bin (MTK Hybrid Game). ARM code will be ignored.");
        }
    }
    getMainClassName() {
        if (this.config.mainClass) {
            return this.config.mainClass;
        }
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
            text = text.replace(/\r\n[ \t]|\n[ \t]|\r[ \t]/g, '');
            const match = text.match(/MIDlet-1:\s*[^,]+,\s*[^,]*,\s*(\S+)/i);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return null;
    }
    start() {
        const mainClass = this.getMainClassName();
        if (!mainClass) {
            throw new Error("Could not determine main class");
        }
        console.log(`Launcher: Starting ${mainClass}...`);
        const systemClassPath = new system_class_path_1.SystemClassPath();
        const jarClassPath = new JarClassPath_1.JarClassPath(this.loader);
        const classLoader = new class_loader_1.ClassLoader(jarClassPath, systemClassPath);
        try {
            const classInfo = classLoader.loadClass(mainClass);
            console.log(`✅ Main class loaded: ${classInfo.thisClass}`);
            console.log(`   Extends: ${classInfo.superClass || 'none'}`);
            const { VMExecutor } = require('../../vm-core/vm-executor');
            const executor = new VMExecutor(classLoader);
            console.log(`\n🎮 Creating MIDlet instance...`);
            const midletInstance = executor.createInstance(mainClass);
            console.log(`✅ MIDlet instance created: ${midletInstance.toString()}`);
            console.log(`\n🔧 Calling constructor...`);
            try {
                executor.invokeConstructor(midletInstance, "()V");
                console.log(`✅ Constructor executed successfully`);
            }
            catch (e) {
                console.error(`❌ Constructor failed: ${e}`);
            }
            console.log(`\n🚀 Calling startApp()...`);
            try {
                executor.invokeInstanceMethod(midletInstance, "startApp", "()V");
                console.log(`✅ startApp() executed successfully`);
                console.log(`\n🎉 MIDlet started successfully!`);
            }
            catch (e) {
                console.error(`❌ startApp() failed: ${e}`);
                throw e;
            }
        }
        catch (e) {
            console.error(`❌ Failed to start MIDlet: ${e}`);
            if (e instanceof Error) {
                console.error(e.stack);
            }
            throw e;
        }
    }
}
exports.Launcher = Launcher;
//# sourceMappingURL=Launcher.js.map