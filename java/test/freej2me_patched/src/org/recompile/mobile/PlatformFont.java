/*
 * Decompiled with CFR 0.152.
 */
package org.recompile.mobile;

import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.microedition.lcdui.Font;
import org.recompile.mobile.Mobile;

public class PlatformFont {
    protected static final byte[] fontSizes = new byte[]{7, 8, 10, 12, 9, 11, 13, 14, 10, 12, 13, 15, 11, 13, 15, 17};
    public static final byte[] fontPadding = new byte[]{1, 2, 2, 3};
    protected boolean isLCDUI;
    public static byte screenType = (byte)-4;
    protected int face;
    protected int style;
    protected int size;
    protected int ascent;
    protected int descent;
    protected int height;
    protected static com.nttdocomo.ui.Font defaultDoJaFont = null;
    protected static Font defaultFont = null;
    private FontMetrics metrics;
    private static Graphics gc;
    public java.awt.Font awtFont;
    private static final File textfontDir;

    public PlatformFont(int n, int n2, int n3, boolean bl) {
        Object var5_5 = null;
        if (bl && n != 0 && n != 64 && n != 32 && n2 != 0 && n2 != 2 && n2 != 1 && n3 != 8 && n3 != 0 && n3 != 16) {
            throw new IllegalArgumentException("Cannot create a LCDUI font with invalid face, style or size. style " + n2 + " face " + n + " size " + n3);
        }
        if (!bl && n != 0x71000000 && n != 0x73000000 && n != 0x72000000 && n2 != 0x70100000 && n2 != 1880227840 && n2 != 0x70110000 && n2 != 1880293376 && n3 != 0x70000100 && n3 != 0x70000200 && n3 != 0x70000300) {
            throw new IllegalArgumentException("Cannot create a DoJa font with invalid face, style or size. style " + n2 + " face " + n + " size " + n3);
        }
        this.isLCDUI = bl;
        this.face = n;
        this.style = n2;
        this.size = n3;
        this.awtFont = new java.awt.Font("SansSerif", 0, this.getPointSize());
        if (gc == null) {
            gc = new BufferedImage(1, 1, 1).getGraphics();
        }
        gc.setFont(this.awtFont);
        this.metrics = gc.getFontMetrics();
        this.height = gc.getFontMetrics().getHeight();
        this.ascent = gc.getFontMetrics().getAscent();
        this.descent = gc.getFontMetrics().getDescent();
    }

    public int stringWidth(String string) {
        if (string == null) {
            throw new NullPointerException("Cannot get stringWidth from a null String");
        }
        return this.metrics.stringWidth(string);
    }

    public int substringWidth(String string, int n, int n2) {
        if (string == null) {
            throw new NullPointerException("Cannot get substringWidth of a null String");
        }
        if (n < 0 || n2 < 0 || n + n2 > string.length()) {
            throw new StringIndexOutOfBoundsException("substringWidth tried to access invalid index on received string");
        }
        return this.stringWidth(string.substring(n, n + n2));
    }

    public int getFace() {
        return this.face;
    }

    public int getHeight() {
        return this.height;
    }

    public int getAscent() {
        return this.ascent;
    }

    public int getDescent() {
        return this.descent;
    }

    public int getSize() {
        return this.size;
    }

    public int getPointSize() {
        return this.convertSize(this.size);
    }

    public int getStyle() {
        return this.style;
    }

    public int convertDoJaToLCDUIStyle(int n) {
        switch (n) {
            case 0x70110000: {
                return 1;
            }
            case 1880293376: {
                return 3;
            }
            case 1880227840: {
                return 2;
            }
        }
        return n;
    }

    public int convertDoJaToLCDUIFace(int n) {
        switch (n) {
            case 0x72000000: {
                return 32;
            }
            case 0x73000000: {
                return 64;
            }
            case 0x71000000: {
                return 0;
            }
        }
        return n;
    }

    public int convertDoJaToLCDUISize(int n) {
        switch (n) {
            case 0x70000300: {
                return 16;
            }
            case 0x70000200: {
                return 0;
            }
            case 0x70000100: {
                return 8;
            }
        }
        return n;
    }

    public static void setScreenSize(int n, int n2) {
        int n3 = Math.min(n, n2);
        screenType = (byte)(n3 < 128 ? 0 : (n3 < 176 ? 1 : (n3 < 220 ? 2 : 3)));
        defaultFont = new Font(0, 0, 0);
        defaultDoJaFont = new com.nttdocomo.ui.Font(0x71000000, 0x70100000, 0x70000200);
    }

    public static void updateDefaultFont() {
        defaultFont = new Font(PlatformFont.defaultFont.face, PlatformFont.defaultFont.style, PlatformFont.defaultFont.size);
        defaultDoJaFont = new com.nttdocomo.ui.Font(PlatformFont.defaultDoJaFont.face, PlatformFont.defaultDoJaFont.style, PlatformFont.defaultDoJaFont.size);
    }

    private int convertSize(int n) {
        if (!this.isLCDUI) {
            n = this.convertDoJaToLCDUISize(n);
        }
        switch (n) {
            case 16: {
                return fontSizes[4 * screenType + 3] + Mobile.fontSizeOffset;
            }
            case 0: {
                return fontSizes[4 * screenType + 2] + Mobile.fontSizeOffset;
            }
            case 8: {
                return fontSizes[4 * screenType + 1] + Mobile.fontSizeOffset;
            }
            case 0x70000400: {
                return fontSizes[4 * screenType] + Mobile.fontSizeOffset;
            }
        }
        return fontSizes[4 * screenType + 1] + Mobile.fontSizeOffset;
    }

    static {
        textfontDir = new File("freej2me_system" + File.separatorChar + "customFont" + File.separatorChar);
    }
}

