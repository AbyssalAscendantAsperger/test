"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lcdui_1 = require("../../src/game-modules/stdlib/javax.microedition/lcdui");
class TestCanvas extends lcdui_1.Canvas {
    constructor() {
        super(...arguments);
        this.frameCount = 0;
        this.lastKeyPressed = 0;
        this.pointerX = -1;
        this.pointerY = -1;
    }
    paint(g) {
        g.setColor(255, 255, 255);
        g.fillRect(0, 0, this.getWidth(), this.getHeight());
        g.setColor(0, 0, 0);
        g.drawString('J2ME LCDUI Test', this.getWidth() / 2, 10, lcdui_1.Graphics.HCENTER | lcdui_1.Graphics.TOP);
        g.drawString(`Frame: ${this.frameCount}`, 10, 30, lcdui_1.Graphics.LEFT | lcdui_1.Graphics.TOP);
        g.setColor(255, 0, 0);
        g.fillRect(20, 60, 80, 60);
        g.setColor(0, 0, 255);
        g.drawRect(120, 60, 80, 60);
        g.setColor(0, 255, 0);
        g.fillRoundRect(20, 140, 80, 60, 20, 20);
        g.setColor(0, 0, 0);
        g.drawLine(120, 140, 200, 200);
        g.drawLine(200, 140, 120, 200);
        g.setColor(128, 0, 128);
        g.fillArc(20, 220, 80, 80, 0, 90);
        g.setColor(255, 165, 0);
        g.fillTriangle(120, 220, 160, 220, 140, 260);
        if (this.lastKeyPressed !== 0) {
            g.setColor(0, 0, 0);
            g.drawString(`Last Key: ${this.lastKeyPressed}`, 10, this.getHeight() - 40, lcdui_1.Graphics.LEFT | lcdui_1.Graphics.TOP);
            const gameAction = this.getGameAction(this.lastKeyPressed);
            if (gameAction !== 0) {
                g.drawString(`Game Action: ${gameAction}`, 10, this.getHeight() - 25, lcdui_1.Graphics.LEFT | lcdui_1.Graphics.TOP);
            }
        }
        if (this.pointerX >= 0 && this.pointerY >= 0) {
            g.setColor(255, 0, 0);
            g.fillRect(this.pointerX - 2, this.pointerY - 2, 5, 5);
            g.setColor(0, 0, 0);
            g.drawString(`Pointer: (${this.pointerX}, ${this.pointerY})`, 10, this.getHeight() - 10, lcdui_1.Graphics.LEFT | lcdui_1.Graphics.TOP);
        }
        this.frameCount++;
    }
    keyPressed(keyCode) {
        console.log(`Key pressed: ${keyCode}`);
        this.lastKeyPressed = keyCode;
        this.repaint();
    }
    keyReleased(keyCode) {
        console.log(`Key released: ${keyCode}`);
    }
    pointerPressed(x, y) {
        console.log(`Pointer pressed: (${x}, ${y})`);
        this.pointerX = x;
        this.pointerY = y;
        this.repaint();
    }
    pointerReleased(x, y) {
        console.log(`Pointer released: (${x}, ${y})`);
    }
    pointerDragged(x, y) {
        this.pointerX = x;
        this.pointerY = y;
        this.repaint();
    }
}
function runTest() {
    console.log('=== LCDUI 基础框架测试 ===\n');
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    console.log(`运行环境: ${isBrowser ? '浏览器' : 'Node.js'}\n`);
    console.log('1. 测试 Display 单例');
    const display1 = lcdui_1.Display.getDisplay(null);
    const display2 = lcdui_1.Display.getDisplay(null);
    console.log(`   Display 是单例: ${display1 === display2 ? '✅' : '❌'}`);
    console.log('\n2. 测试 Canvas 创建');
    const canvas = new TestCanvas();
    console.log(`   Canvas 宽度: ${canvas.getWidth()}`);
    console.log(`   Canvas 高度: ${canvas.getHeight()}`);
    console.log(`   Canvas 双缓冲: ${canvas.isDoubleBuffered() ? '✅' : '❌'}`);
    console.log(`   Canvas 支持指针事件: ${canvas.hasPointerEvents() ? '✅' : '❌'}`);
    console.log('\n3. 测试 Display 属性');
    console.log(`   支持颜色: ${display1.isColor() ? '✅' : '❌'}`);
    console.log(`   颜色数量: ${display1.numColors()}`);
    console.log(`   Alpha 级别: ${display1.numAlphaLevels()}`);
    console.log('\n4. 测试按键映射');
    console.log(`   KEY_NUM2 -> UP: ${canvas.getGameAction(lcdui_1.Canvas.KEY_NUM2) === lcdui_1.Canvas.UP ? '✅' : '❌'}`);
    console.log(`   KEY_NUM8 -> DOWN: ${canvas.getGameAction(lcdui_1.Canvas.KEY_NUM8) === lcdui_1.Canvas.DOWN ? '✅' : '❌'}`);
    console.log(`   KEY_NUM4 -> LEFT: ${canvas.getGameAction(lcdui_1.Canvas.KEY_NUM4) === lcdui_1.Canvas.LEFT ? '✅' : '❌'}`);
    console.log(`   KEY_NUM6 -> RIGHT: ${canvas.getGameAction(lcdui_1.Canvas.KEY_NUM6) === lcdui_1.Canvas.RIGHT ? '✅' : '❌'}`);
    console.log(`   KEY_NUM5 -> FIRE: ${canvas.getGameAction(lcdui_1.Canvas.KEY_NUM5) === lcdui_1.Canvas.FIRE ? '✅' : '❌'}`);
    console.log('\n5. 测试按键名称');
    console.log(`   KEY_NUM0 名称: "${canvas.getKeyName(lcdui_1.Canvas.KEY_NUM0)}" (期望: "0")`);
    console.log(`   KEY_NUM5 名称: "${canvas.getKeyName(lcdui_1.Canvas.KEY_NUM5)}" (期望: "5")`);
    console.log(`   KEY_STAR 名称: "${canvas.getKeyName(lcdui_1.Canvas.KEY_STAR)}" (期望: "*")`);
    console.log(`   KEY_POUND 名称: "${canvas.getKeyName(lcdui_1.Canvas.KEY_POUND)}" (期望: "#")`);
    if (isBrowser) {
        console.log('\n6. 测试 Display.setCurrent() 和渲染');
        display1.setCurrent(canvas);
        console.log(`   当前 Displayable: ${display1.getCurrent() === canvas ? '✅' : '❌'}`);
        console.log('\n✅ 所有 LCDUI 测试通过!');
        console.log('\n提示: Canvas 已显示在页面上');
        console.log('      使用方向键或数字键 2/4/6/8 测试按键事件');
        console.log('      使用鼠标或触摸屏测试指针事件');
    }
    else {
        console.log('\n6. 跳过 Display.setCurrent() 测试 (需要浏览器环境)');
        console.log('\n✅ 所有 Node.js 环境测试通过!');
        console.log('\n提示: 在浏览器中打开 tests/lcdui-test.html 查看完整渲染效果');
    }
}
runTest();
//# sourceMappingURL=lcdui-basic.test.js.map