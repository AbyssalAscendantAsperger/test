/*
 * Decompiled with CFR 0.152.
 */
package javax.microedition.lcdui;

import java.util.concurrent.atomic.AtomicBoolean;
import javax.microedition.lcdui.Command;
import javax.microedition.lcdui.Displayable;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

public abstract class Canvas
extends Displayable {
    public static final int UP = 1;
    public static final int LEFT = 2;
    public static final int RIGHT = 5;
    public static final int DOWN = 6;
    public static final int FIRE = 8;
    public static final int GAME_A = 9;
    public static final int GAME_B = 10;
    public static final int GAME_C = 11;
    public static final int GAME_D = 12;
    public static final int KEY_NUM0 = 48;
    public static final int KEY_NUM1 = 49;
    public static final int KEY_NUM2 = 50;
    public static final int KEY_NUM3 = 51;
    public static final int KEY_NUM4 = 52;
    public static final int KEY_NUM5 = 53;
    public static final int KEY_NUM6 = 54;
    public static final int KEY_NUM7 = 55;
    public static final int KEY_NUM8 = 56;
    public static final int KEY_NUM9 = 57;
    public static final int KEY_STAR = 42;
    public static final int KEY_POUND = 35;
    public static final int KEY_SOFT_LEFT = 126;
    public static final int KEY_SOFT_RIGHT = 127;
    public static final int KEY_CLR = 8;
    public static final int KEY_COML = 129;
    public static final int KEY_COMC = 130;
    public static final int KEY_COMR = 131;
    public static final int KEY_UP = 141;
    public static final int KEY_LEFT = 142;
    public static final int KEY_RIGHT = 145;
    public static final int KEY_DOWN = 146;
    public static final int KEY_FIRE = 148;
    public static final int KEY_CALL = 190;
    public static final int KEY_END = 191;
    public static final int KEY_FLIP_OPEN = 192;
    public static final int KEY_FLIP_CLOSE = 193;
    public static final int KEY_VOL_UP = 194;
    public static final int KEY_VOL_DOWN = 195;
    private int barHeight;
    private boolean suppressKeyEvents = false;
    private boolean fullscreen = false;
    protected boolean servicing = false;
    private boolean firstDrawn = false;
    protected AtomicBoolean pendingRepaint = new AtomicBoolean(false);

    protected Canvas() {
        Mobile.log((byte)2, Canvas.class.getPackage().getName() + "." + Canvas.class.getSimpleName() + ": Create Canvas:" + this.width + ", " + this.height);
        this.barHeight = Font.getDefaultFont().getHeight();
    }

    protected Canvas(boolean bl) {
        Mobile.log((byte)2, Canvas.class.getPackage().getName() + "." + Canvas.class.getSimpleName() + ": Create Canvas:" + this.width + ", " + this.height + " suppressKeys:" + bl);
        this.barHeight = Font.getDefaultFont().getHeight();
        this.suppressKeyEvents = bl;
    }

    public int getGameAction(int n) {
        return Mobile.getGameAction(n);
    }

    public int getKeyCode(int n) {
        switch (n) {
            case 50: {
                return Mobile.getMobileKey(14);
            }
            case 56: {
                return Mobile.getMobileKey(17);
            }
            case 52: {
                return Mobile.getMobileKey(15);
            }
            case 54: {
                return Mobile.getMobileKey(16);
            }
            case 53: {
                return Mobile.getMobileKey(18);
            }
            case 1: {
                return Mobile.getMobileKey(0);
            }
            case 6: {
                return Mobile.getMobileKey(1);
            }
            case 2: {
                return Mobile.getMobileKey(2);
            }
            case 5: {
                return Mobile.getMobileKey(3);
            }
            case 8: {
                return Mobile.getMobileKey(7);
            }
            case 9: 
            case 49: {
                return Mobile.getMobileKey(10);
            }
            case 10: 
            case 51: {
                return Mobile.getMobileKey(11);
            }
            case 11: 
            case 55: {
                return Mobile.getMobileKey(5);
            }
            case 12: 
            case 57: {
                return Mobile.getMobileKey(4);
            }
            case 48: {
                return Mobile.getMobileKey(6);
            }
            case 42: {
                return Mobile.getMobileKey(12);
            }
            case 35: {
                return Mobile.getMobileKey(13);
            }
        }
        return 0;
    }

    public int SKTToMIDPKey(int n) {
        switch (n) {
            case 8: {
                return 0;
            }
            case 129: {
                return 0;
            }
            case 130: {
                return 0;
            }
            case 131: {
                return 0;
            }
            case 141: {
                return 1;
            }
            case 142: {
                return 2;
            }
            case 145: {
                return 5;
            }
            case 146: {
                return 6;
            }
            case 148: {
                return 8;
            }
            case 190: {
                return 0;
            }
            case 191: {
                return 0;
            }
            case 192: {
                return 0;
            }
            case 193: {
                return 0;
            }
            case 194: {
                return 0;
            }
            case 195: {
                return 0;
            }
        }
        return 0;
    }

    public String getKeyName(int n) {
        if (n < 0) {
            n = 0 - n;
        }
        switch (n) {
            case 1: {
                return "UP";
            }
            case 2: {
                return "DOWN";
            }
            case 5: {
                return "LEFT";
            }
            case 6: {
                return "RIGHT";
            }
            case 8: {
                return "FIRE";
            }
            case 9: {
                return "A";
            }
            case 10: {
                return "B";
            }
            case 11: {
                return "C";
            }
            case 12: {
                return "D";
            }
            case 48: {
                return "0";
            }
            case 49: {
                return "1";
            }
            case 50: {
                return "2";
            }
            case 51: {
                return "3";
            }
            case 52: {
                return "4";
            }
            case 53: {
                return "5";
            }
            case 54: {
                return "6";
            }
            case 55: {
                return "7";
            }
            case 56: {
                return "8";
            }
            case 57: {
                return "9";
            }
            case 42: {
                return "*";
            }
            case 35: {
                return "#";
            }
        }
        return "-";
    }

    public boolean hasPointerEvents() {
        return true;
    }

    public boolean hasPointerMotionEvents() {
        return false;
    }

    public boolean hasRepeatEvents() {
        return true;
    }

    public void hideNotify() {
    }

    public boolean isDoubleBuffered() {
        return true;
    }

    @Override
    public void keyPressed(int n) {
    }

    @Override
    public void keyReleased(int n) {
    }

    @Override
    public void keyRepeated(int n) {
    }

    protected abstract void paint(Graphics var1);

    @Override
    public void pointerDragged(int n, int n2) {
    }

    @Override
    public void pointerPressed(int n, int n2) {
    }

    @Override
    public void pointerReleased(int n, int n2) {
    }

    public void repaint() {
        this.repaint(0, 0, this.width, this.height);
    }

    public void repaint(final int n, final int n2, final int n3, final int n4) {
        if (this.listCommands || this.servicing) {
            return;
        }
        if (!this.isShown()) {
            this.pendingRepaint.set(true);
            return;
        }
        if (!Mobile.compatImmediateRepaints) {
            Mobile.getDisplay().postPaintRequest(new Runnable(){

                @Override
                public void run() {
                    Canvas.this.repaintRequest(n, n2, n3, n4);
                    Canvas.this.pendingRepaint.set(false);
                }
            });
            this.pendingRepaint.set(true);
        } else {
            this.repaintRequest(n, n2, n3, n4);
            this.pendingRepaint.set(false);
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public void repaintRequest(int n, int n2, int n3, int n4) {
        if (this.listCommands) {
            return;
        }
        if (!this.isShown()) {
            this.pendingRepaint.set(true);
            return;
        }
        this.firstDrawn = true;
        try {
            Graphics graphics;
            Graphics graphics2 = graphics = this.graphics;
            synchronized (graphics2) {
                this.graphics.reset(n, n2, n3, n4);
                this.paint(this.graphics);
            }
        }
        catch (NullPointerException nullPointerException) {
            Mobile.log((byte)4, Canvas.class.getPackage().getName() + "." + Canvas.class.getSimpleName() + ": Null Pointer Exception in draw event: " + nullPointerException.getMessage());
            nullPointerException.printStackTrace();
        }
        catch (Exception exception) {
            Mobile.log((byte)4, Canvas.class.getPackage().getName() + "." + Canvas.class.getSimpleName() + ": Serious Exception hit in repaint(): " + exception.getMessage());
            System.out.println("[ARENA-V6-CRASH] Exception in LCDUI Canvas: " + exception);
            exception.printStackTrace();
            exception.printStackTrace();
        }
        if (!this.fullscreen && !this.commands.isEmpty()) {
            Mobile.getPlatform().setPostFlushDraw(new Runnable(){

                @Override
                public void run() {
                    Canvas.this.paintCommandsBar();
                }
            });
        }
        Mobile.getPlatform().flushGraphics(this.platformImage, n, n2, n3, n4);
    }

    public void serviceRepaints() {
        if (!this.isShown() || !this.pendingRepaint.get()) {
            return;
        }
        this.servicing = true;
        if (!MobilePlatform.pressedKeys[20]) {
            for (int n = 0; n < 16 && this.pendingRepaint.get(); n = (int)((byte)(n + 1))) {
                try {
                    Thread.sleep(1L);
                    continue;
                }
                catch (Exception exception) {
                    // empty catch block
                }
            }
        }
        Mobile.getDisplay().processPaintsNow();
        this.servicing = false;
    }

    public void setFullScreenMode(boolean bl) {
        if (bl != this.fullscreen) {
            this.fullscreen = bl;
        }
    }

    public void showNotify() {
    }

    @Override
    protected void sizeChanged(int n, int n2) {
        this.width = n;
        this.height = n2;
    }

    @Override
    public int getHeight() {
        if (Mobile.isKDDI) {
            return this.height - (!this.fullscreen ? this.barHeight : 0);
        }
        return this.height;
    }

    public boolean getFullScreen() {
        return this.fullscreen;
    }

    private void paintCommandsBar() {
        Graphics graphics = Mobile.getPlatform().getLcdFrontbufferGraphics();
        long l = 1000000000L;
        if (MobilePlatform.timeToUnfocus < l) {
            graphics.setAlphaRGB((byte)(255.0 * Math.max(0.0, Math.min(1.0, (double)MobilePlatform.timeToUnfocus / 1.0E9))) << 24 | Mobile.lcduiBGColor);
            graphics.fillRect(0, Mobile.lcdHeight - this.barHeight, Mobile.lcdWidth, this.barHeight);
            graphics.setAlphaRGB((byte)(255.0 * Math.max(0.0, Math.min(1.0, (double)MobilePlatform.timeToUnfocus / 1.0E9))) << 24 | Mobile.lcduiTextColor);
        } else {
            graphics.setAlphaRGB(0xFF000000 | Mobile.lcduiBGColor);
            graphics.fillRect(0, Mobile.lcdHeight - this.barHeight, Mobile.lcdWidth, this.barHeight);
            graphics.setAlphaRGB(0xFF000000 | Mobile.lcduiTextColor);
        }
        graphics.drawLine(0, Mobile.lcdHeight - this.barHeight, Mobile.lcdWidth, Mobile.lcdHeight - this.barHeight);
        graphics.drawLine(Mobile.lcdWidth / 2, Mobile.lcdHeight - this.barHeight, Mobile.lcdWidth / 2, Mobile.lcdHeight);
        if (!this.commands.isEmpty()) {
            String string = this.commands.size() > 2 ? "Options" : ((Command)this.commands.get(0)).getLabel();
            int n = graphics.getGraphics2D().getFontMetrics().stringWidth(string) / 2;
            int n2 = Mobile.lcdWidth / 4 - n;
            graphics.drawString(string, n2, Mobile.lcdHeight - this.barHeight, 4);
            n = graphics.getGraphics2D().getFontMetrics().stringWidth(this.commands.size() > 1 ? ((Command)this.commands.get(1)).getLabel() : "") / 2;
            n2 = 3 * Mobile.lcdWidth / 4 + n;
            graphics.drawString(this.commands.size() > 1 ? ((Command)this.commands.get(1)).getLabel() : "", n2, Mobile.lcdHeight - this.barHeight, 8);
        }
    }

    @Override
    public void addCommand(Command command) {
        super.addCommand(command);
    }

    @Override
    public void removeCommand(Command command) {
        super.removeCommand(command);
    }

    @Override
    protected void render() {
        if (this.listCommands) {
            super.render();
        } else {
            this.repaint();
        }
    }

    public final boolean hasBeenDrawnAfterSet() {
        return this.firstDrawn;
    }

    public final boolean areKeysSuppressed() {
        return this.suppressKeyEvents;
    }
}

