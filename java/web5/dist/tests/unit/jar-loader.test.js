"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const JarLoader_1 = require("../../src/game-modules/loader/JarLoader");
const Context_1 = require("../../src/game-modules/context/Context");
const Launcher_1 = require("../../src/game-modules/launcher/Launcher");
async function runTest() {
    console.log('=== JarLoader 集成测试 ===\n');
    const jarPath = path.resolve(__dirname, '../../../tests/integration/Moon英文版.jar');
    console.log(`Loading JAR: ${jarPath}`);
    if (!fs.existsSync(jarPath)) {
        console.error('❌ Test JAR not found!');
        return;
    }
    try {
        const buffer = fs.readFileSync(jarPath);
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        const loader = new JarLoader_1.JarLoader();
        await loader.loadJar(arrayBuffer);
        console.log('✅ JAR Loaded successfully');
        const manifestPath = 'META-INF/MANIFEST.MF';
        if (loader.fileExists(manifestPath)) {
            console.log(`✅ Found ${manifestPath}`);
            const content = loader.getFile(manifestPath);
            if (content) {
                const text = new TextDecoder().decode(content);
                console.log('--- Manifest Content (First 5 lines) ---');
                console.log(text.split('\n').slice(0, 5).join('\n'));
                console.log('----------------------------------------');
            }
        }
        else {
            console.error(`❌ ${manifestPath} not found!`);
        }
        const iconPath = '/icons/ico.png';
        if (loader.fileExists(iconPath)) {
            console.log(`✅ Found ${iconPath}`);
            const img = loader.loadImage(iconPath);
            console.log(`   Image object created: ${img ? '✅' : '❌'}`);
            if (img) {
                console.log(`   Image size: ${img.getWidth()}x${img.getHeight()}`);
            }
            console.log('\n4. 测试 Context 集成');
            Context_1.Context.getInstance().setJarLoader(loader);
            console.log('\n6. 测试 Launcher');
            const launcher = new Launcher_1.Launcher({
                jarData: arrayBuffer
            });
            await launcher.load();
            const mainClass = launcher.getMainClassName();
            console.log(`   Main Class detected: ${mainClass}`);
            try {
                launcher.start();
            }
            catch (e) {
                console.log(`   Launcher start result: ${e.message}`);
            }
        }
        else {
            console.log(`⚠️ ${iconPath} not found`);
        }
    }
    catch (e) {
        console.error('❌ Failed:', e);
    }
}
runTest();
//# sourceMappingURL=jar-loader.test.js.map