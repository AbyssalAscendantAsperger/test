/*
 * Decompiled with CFR 0.152.
 */
package javax.microedition.lcdui;

import org.recompile.mobile.PlatformFont;

public class Font
extends PlatformFont {
    public static final int FACE_MONOSPACE = 32;
    public static final int FACE_PROPORTIONAL = 64;
    public static final int FACE_SYSTEM = 0;
    public static final int FONT_INPUT_TEXT = 1;
    public static final int FONT_STATIC_TEXT = 0;
    public static final int SIZE_LARGE = 16;
    public static final int SIZE_MEDIUM = 0;
    public static final int SIZE_SMALL = 8;
    public static final int STYLE_BOLD = 1;
    public static final int STYLE_ITALIC = 2;
    public static final int STYLE_PLAIN = 0;
    public static final int STYLE_UNDERLINED = 4;

    public Font(int n, int n2, int n3) {
        super(n, n2, n3, true);
    }

    public int charsWidth(char[] cArray, int n, int n2) {
        if (cArray == null) {
            throw new NullPointerException("Cannot do charsWidth() with a null char array");
        }
        if (n < 0 || n2 < 0 || n + n2 > cArray.length) {
            throw new ArrayIndexOutOfBoundsException("charsWidth tried to access invalid char array index");
        }
        String string = new String(cArray, n, n2);
        return this.stringWidth(string);
    }

    public int charWidth(char c) {
        return this.stringWidth(String.valueOf(c));
    }

    public int getBaselinePosition() {
        return this.getAscent();
    }

    public static Font getDefaultFont() {
        return defaultFont;
    }

    public static Font getFont(int n) {
        if (n != 1 && n != 0) {
            throw new IllegalArgumentException("Cannot get font with an invalid specifier");
        }
        return defaultFont;
    }

    public static Font getFont(int n, int n2, int n3) {
        System.out.println("[ARENA-V6-FONT] LCDUI Font.getFont req face=" + n + " style=" + n2 + " size=" + n3 + " -> OVERRIDING TO SYSTEM/PLAIN!");
        return new Font(0, 0, n3);
    }

    public boolean isBold() {
        return (this.style & 1) == 1;
    }

    public boolean isItalic() {
        return (this.style & 2) == 2;
    }

    public boolean isPlain() {
        return this.style == 0;
    }

    public boolean isUnderlined() {
        return (this.style & 4) == 4;
    }
}

