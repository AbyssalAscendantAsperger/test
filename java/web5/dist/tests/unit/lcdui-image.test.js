"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lcdui_1 = require("../../src/game-modules/stdlib/javax.microedition/lcdui");
function runTest() {
    console.log('=== LCDUI Image & Font 测试 ===\n');
    console.log('1. 测试 Image 创建 (可变)');
    try {
        const img = lcdui_1.Image.createImage(100, 50);
        console.log(`   创建成功: ${img.getWidth() === 100 && img.getHeight() === 50 ? '✅' : '❌'}`);
        console.log(`   是可变图像: ${img.isMutable() ? '✅' : '❌'}`);
        const g = img.getGraphics();
        console.log(`   获取 Graphics: ${g ? '✅' : '❌'}`);
        g.setColor(255, 0, 0);
        g.fillRect(0, 0, 100, 50);
        console.log('   绘图操作: ✅');
    }
    catch (e) {
        console.log(`   ❌ 失败: ${e}`);
    }
    console.log('\n2. 测试 Image 创建 (不可变)');
    try {
        const img = lcdui_1.Image.createImageFromPath('test.png');
        console.log(`   创建成功: ${img ? '✅' : '❌'}`);
        console.log(`   是不可变图像: ${!img.isMutable() ? '✅' : '❌'}`);
        try {
            img.getGraphics();
            console.log('   获取 Graphics (应失败): ❌');
        }
        catch (e) {
            console.log('   获取 Graphics (应失败): ✅');
        }
    }
    catch (e) {
        console.log(`   ❌ 失败: ${e}`);
    }
    console.log('\n3. 测试 Font');
    const font = lcdui_1.Font.getFont(lcdui_1.Font.FACE_SYSTEM, lcdui_1.Font.STYLE_BOLD | lcdui_1.Font.STYLE_ITALIC, lcdui_1.Font.SIZE_LARGE);
    console.log(`   Font 创建: ${font ? '✅' : '❌'}`);
    console.log(`   Is Bold: ${font.isBold() ? '✅' : '❌'}`);
    console.log(`   Is Italic: ${font.isItalic() ? '✅' : '❌'}`);
    console.log(`   Size: ${font.getSize() === lcdui_1.Font.SIZE_LARGE ? '✅' : '❌'}`);
    const defaultFont = lcdui_1.Font.getDefaultFont();
    console.log(`   Default Font: ${defaultFont ? '✅' : '❌'}`);
    const width = font.stringWidth("Hello");
    console.log(`   stringWidth("Hello"): ${width} (Node环境估算)`);
    console.log(`   getHeight(): ${font.getHeight()}`);
    console.log(`   getBaselinePosition(): ${font.getBaselinePosition()}`);
    console.log('\n✅ Image & Font 单元测试完成');
}
runTest();
//# sourceMappingURL=lcdui-image.test.js.map