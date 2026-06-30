/*
 * Decompiled with CFR 0.152.
 */
package org.recompile.mobile;

import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.GraphicsEnvironment;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
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
    private static boolean fontsRegistered = false;
    private static String defaultFontFamily = "Noto Sans";
    private static String monoFontFamily = "Noto Sans Mono";

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
        registerBundledFonts();
        this.awtFont = new java.awt.Font(this.resolveAwtFontFamily(), this.resolveAwtFontStyle(), this.getPointSize());
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

    private String resolveAwtFontFamily() {
        int lcdFace = this.isLCDUI ? this.face : this.convertDoJaToLCDUIFace(this.face);
        if (lcdFace == 32 && isFamilyAvailable(monoFontFamily)) {
            return monoFontFamily;
        }
        if (isFamilyAvailable(defaultFontFamily)) {
            return defaultFontFamily;
        }
        if (isFamilyAvailable("Noto Sans CJK JP")) {
            return "Noto Sans CJK JP";
        }
        if (isFamilyAvailable("Noto Sans CJK SC")) {
            return "Noto Sans CJK SC";
        }
        if (isFamilyAvailable("Noto Sans")) {
            return "Noto Sans";
        }
        return "Dialog";
    }

    private int resolveAwtFontStyle() {
        int lcdStyle = this.isLCDUI ? this.style : this.convertDoJaToLCDUIStyle(this.style);
        int awtStyle = java.awt.Font.PLAIN;
        if ((lcdStyle & 1) != 0) {
            awtStyle |= java.awt.Font.BOLD;
        }
        if ((lcdStyle & 2) != 0) {
            awtStyle |= java.awt.Font.ITALIC;
        }
        return awtStyle;
    }

    private static boolean isFamilyAvailable(String family) {
        String[] names = GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames();
        for (int i = 0; i < names.length; i++) {
            if (names[i].equalsIgnoreCase(family)) {
                return true;
            }
        }
        return false;
    }

    public static synchronized void registerBundledFonts() {
        if (fontsRegistered) {
            return;
        }
        fontsRegistered = true;
        registerKnownResourceFonts();
        registerFontsFromDirectory(textfontDir);
        registerFontsFromDirectory(new File("freej2me_system" + File.separatorChar + "fonts" + File.separatorChar));
        String systemPath = System.getProperty("freej2me.systemPath");
        if (systemPath != null && systemPath.length() > 0) {
            registerFontsFromDirectory(new File(systemPath + File.separatorChar + "customFont" + File.separatorChar));
            registerFontsFromDirectory(new File(systemPath + File.separatorChar + "fonts" + File.separatorChar));
        }
        Mobile.log(Mobile.LOG_INFO, PlatformFont.class.getPackage().getName() + "." + PlatformFont.class.getSimpleName() + ": " + "Font bootstrap complete. Preferred family=" + defaultFontFamily + ", mono=" + monoFontFamily);
    }

    private static void registerKnownResourceFonts() {
        String[] fontResources = new String[] {
            "/fonts/NotoSans-Regular.ttf",
            "/fonts/NotoSans-Bold.ttf",
            "/fonts/NotoSans-Italic.ttf",
            "/fonts/NotoSans-BoldItalic.ttf",
            "/fonts/NotoSansMono-Regular.ttf",
            "/fonts/NotoSansMono-Bold.ttf",
            "/fonts/NotoSansSymbols-Regular.ttf",
            "/fonts/NotoSansSymbols2-Regular.ttf",
            "/fonts/NotoEmoji-Regular.ttf",
            "/fonts/NotoSansThai-Regular.ttf",
            "/fonts/NotoSansArabic-Regular.ttf",
            "/fonts/NotoSansDevanagari-Regular.ttf",
            "/fonts/NotoSansBengali-Regular.ttf",
            "/fonts/NotoSansTamil-Regular.ttf",
            "/fonts/NotoSansTelugu-Regular.ttf",
            "/fonts/NotoSansMyanmar-Regular.ttf",
            "/fonts/NotoSansJP-Regular.otf",
            "/fonts/NotoSansSC-Regular.otf",
            "/fonts/NotoSansTC-Regular.otf",
            "/fonts/NotoSansKR-Regular.otf",
            "/fonts/NotoSansCJKjp-Regular.otf",
            "/fonts/NotoSansCJKsc-Regular.otf",
            "/fonts/NotoSansCJKtc-Regular.otf",
            "/fonts/NotoSansCJKkr-Regular.otf"
        };
        for (int i = 0; i < fontResources.length; i++) {
            registerFontResource(fontResources[i]);
        }
    }

    private static void registerFontResource(String resource) {
        InputStream input = null;
        try {
            input = PlatformFont.class.getResourceAsStream(resource);
            if (input == null) {
                return;
            }
            java.awt.Font font = java.awt.Font.createFont(java.awt.Font.TRUETYPE_FONT, input);
            GraphicsEnvironment.getLocalGraphicsEnvironment().registerFont(font);
            Mobile.log(Mobile.LOG_INFO, PlatformFont.class.getPackage().getName() + "." + PlatformFont.class.getSimpleName() + ": " + "Registered bundled font: " + resource + " -> " + font.getFamily());
        }
        catch (Exception exception) {
            Mobile.log(Mobile.LOG_WARNING, PlatformFont.class.getPackage().getName() + "." + PlatformFont.class.getSimpleName() + ": " + "Could not register bundled font " + resource + ": " + exception.getMessage());
        }
        finally {
            try {
                if (input != null) {
                    input.close();
                }
            }
            catch (Exception ignored) {}
        }
    }

    private static void registerFontsFromDirectory(File dir) {
        if (dir == null || !dir.exists() || !dir.isDirectory()) {
            return;
        }
        List<File> fonts = new ArrayList<File>();
        collectFontFiles(dir, fonts);
        for (int i = 0; i < fonts.size(); i++) {
            registerFontFile(fonts.get(i));
        }
    }

    private static void collectFontFiles(File dir, List<File> fonts) {
        File[] files = dir.listFiles();
        if (files == null) {
            return;
        }
        for (int i = 0; i < files.length; i++) {
            File file = files[i];
            if (file.isDirectory()) {
                collectFontFiles(file, fonts);
                continue;
            }
            String name = file.getName().toLowerCase();
            if (name.endsWith(".ttf") || name.endsWith(".otf") || name.endsWith(".ttc")) {
                fonts.add(file);
            }
        }
    }

    private static void registerFontFile(File file) {
        try {
            java.awt.Font font = java.awt.Font.createFont(java.awt.Font.TRUETYPE_FONT, file);
            GraphicsEnvironment.getLocalGraphicsEnvironment().registerFont(font);
            Mobile.log(Mobile.LOG_INFO, PlatformFont.class.getPackage().getName() + "." + PlatformFont.class.getSimpleName() + ": " + "Registered external font: " + file.getPath() + " -> " + font.getFamily());
        }
        catch (Exception exception) {
            Mobile.log(Mobile.LOG_WARNING, PlatformFont.class.getPackage().getName() + "." + PlatformFont.class.getSimpleName() + ": " + "Could not register external font " + file.getPath() + ": " + exception.getMessage());
        }
    }

    static {
        textfontDir = new File("freej2me_system" + File.separatorChar + "customFont" + File.separatorChar);
    }
}

