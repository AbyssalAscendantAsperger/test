/*
 * Decompiled with CFR 0.152.
 */
package org.recompile.mobile;

import com.nttdocomo.opt.ui.PointingDevice;
import com.nttdocomo.ui.Canvas;
import com.nttdocomo.ui.Display;
import com.xce.lcdui.Toolkit;
import com.xce.lcdui.XDisplay;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.net.URLDecoder;
import java.util.Arrays;
import java.util.HashMap;
import java.util.concurrent.locks.LockSupport;
import javax.microedition.lcdui.Displayable;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Graphics;
import javax.microedition.media.Manager;
import org.recompile.mobile.MIDletLoader;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.PlatformFont;
import org.recompile.mobile.PlatformGraphics;
import org.recompile.mobile.PlatformImage;

public class MobilePlatform {
    private static PlatformImage lcdFrontbuffer;
    private PlatformGraphics gcFrontbuffer;
    private static PlatformImage lcd;
    private PlatformGraphics gc;
    public static int lcdWidth;
    public static int lcdHeight;
    private long lastRenderTime = System.nanoTime();
    private long requiredFrametime = 0L;
    private long elapsedTime = 0L;
    private long sleepTime = 0L;
    public static String showFPS;
    public static boolean focusCommandBar;
    public static long timeToUnfocus;
    public static boolean isLibretro;
    public static boolean appTerminated;
    public MIDletLoader loader;
    public static Displayable displayable;
    public String dataPath = "";
    public static String fileName;
    private static String kjxJadFileName;
    public static volatile int keyState;
    public static volatile int vodafoneKeyState;
    public static volatile int doJaKeyState;
    public static boolean[] pressedKeys;
    public static Runnable painter;
    public static Runnable postDraw;

    public MobilePlatform(int n, int n2) {
        boolean bl = false;
        for (String string : Mobile.supportedEncodings) {
            if (!string.equals(System.getProperty("file.encoding"))) continue;
            bl = true;
        }
        if (!bl) {
            Mobile.textEncoding = Mobile.supportedEncodings[0];
            MobilePlatform.checkFileEncoding();
        }
        this.resizeLCD(n, n2);
        painter = new Runnable(){

            @Override
            public void run() {
            }
        };
    }

    public void resizeLCD(int n, int n2) {
        if (lcdWidth == n && lcdHeight == n2) {
            return;
        }
        lcdWidth = n;
        lcdHeight = n2;
        PlatformFont.setScreenSize(n, n2);
        lcdFrontbuffer = new PlatformImage(n, n2);
        lcd = new PlatformImage(n, n2);
        this.gcFrontbuffer = lcdFrontbuffer.getMIDPGraphics();
        if (!Mobile.isDoJa) {
            this.gc = lcd.getMIDPGraphics();
            XDisplay.width = n;
            XDisplay.height2 = n2;
            XDisplay.platformImage = lcd;
            Toolkit.graphics = (Graphics)this.gc;
            if (Mobile.getDisplay() != null && Mobile.getDisplay().getCurrent() != null) {
                Mobile.getDisplay().getCurrent().doSizeChanged(n, n2);
                Mobile.getDisplay().getCurrent().platformImage = lcd;
                Mobile.getDisplay().getCurrent().graphics = (Graphics)this.gc;
            }
        } else if (Mobile.isDoJa && Display.getCurrent() != null) {
            Display.getCurrent().platformImage = lcd;
            Display.getCurrent().graphics = lcd.getDoJaGraphics();
        }
    }

    public static PlatformImage getLcdBackbuffer() {
        return lcd;
    }

    public PlatformImage getLcdFrontbuffer() {
        return lcdFrontbuffer;
    }

    public Graphics getLcdFrontbufferGraphics() {
        return (Graphics)this.gcFrontbuffer;
    }

    public void setPainter(Runnable runnable) {
        painter = runnable;
    }

    public static void pauseResumeApp() {
        if (!Mobile.isDoJa) {
            displayable = Mobile.getDisplay().getCurrent();
            if (!(displayable instanceof javax.microedition.lcdui.Canvas)) {
                return;
            }
            if (!Mobile.isPaused) {
                ((javax.microedition.lcdui.Canvas)displayable).hideNotify();
                try {
                    Mobile.midlet.callPauseApp();
                }
                catch (Exception exception) {
                    exception.printStackTrace();
                }
                Mobile.isPaused = true;
                painter.run();
            } else {
                Mobile.isPaused = false;
                ((javax.microedition.lcdui.Canvas)displayable).showNotify();
                try {
                    Mobile.midlet.callStartApp();
                }
                catch (Exception exception) {
                    exception.printStackTrace();
                }
                painter.run();
            }
        }
    }

    public static void keyPressed(final int n) {
        if (appTerminated) {
            return;
        }
        Mobile.dlog("MobilePlatform", "keyPressed: keyCode=", n);
        if (!MIDletLoader.MIDletSelected) {
            MIDletLoader.keyPress(Mobile.getGameAction(n));
        } else if (!Mobile.isPaused) {
            MobilePlatform.updateKeyState(Mobile.getGameAction(n), true);
            MobilePlatform.updateVodafoneKeyState(Mobile.getCanvasAction(n), true);
            MobilePlatform.updateDoJaKeyState(Mobile.getCanvasAction(n), true);
            if (!Mobile.isDoJa && Mobile.getDisplay() != null && (displayable = Mobile.getDisplay().getCurrent()) != null) {
                Mobile.dlog("MobilePlatform", "keyPressed: posting input event to displayable=", displayable.getClass().getName());
                Mobile.getDisplay().postInputEvent(new Runnable(){

                    @Override
                    public void run() {
                        if (!MobilePlatform.handleCommands(Mobile.getCanvasAction(n)) && displayable instanceof javax.microedition.lcdui.Canvas && !((javax.microedition.lcdui.Canvas)displayable).areKeysSuppressed()) {
                            displayable.keyPressed(n);
                        }
                    }
                });
            }
        }
    }

    public static void keyReleased(final int n) {
        if (appTerminated) {
            return;
        }
        if (!Mobile.isPaused && MIDletLoader.MIDletSelected) {
            MobilePlatform.updateKeyState(Mobile.getGameAction(n), false);
            MobilePlatform.updateVodafoneKeyState(Mobile.getCanvasAction(n), false);
            MobilePlatform.updateDoJaKeyState(Mobile.getCanvasAction(n), false);
            if (!Mobile.isDoJa && Mobile.getDisplay() != null && (displayable = Mobile.getDisplay().getCurrent()) != null && MIDletLoader.MIDletSelected) {
                Mobile.getDisplay().postInputEvent(new Runnable(){

                    @Override
                    public void run() {
                        if (displayable instanceof javax.microedition.lcdui.Canvas && !((javax.microedition.lcdui.Canvas)displayable).areKeysSuppressed()) {
                            displayable.keyReleased(n);
                        }
                    }
                });
            }
        }
    }

    public static void keyRepeated(final int n) {
        if (appTerminated) {
            return;
        }
        if (!Mobile.isPaused && MIDletLoader.MIDletSelected && !Mobile.isDoJa && Mobile.getDisplay() != null && (displayable = Mobile.getDisplay().getCurrent()) != null) {
            Mobile.getDisplay().postInputEvent(new Runnable(){

                @Override
                public void run() {
                    if (!MobilePlatform.handleCommands(Mobile.getCanvasAction(n)) && displayable instanceof javax.microedition.lcdui.Canvas && !((javax.microedition.lcdui.Canvas)displayable).areKeysSuppressed()) {
                        displayable.keyRepeated(n);
                    }
                }
            });
        }
    }

    public static void pointerDragged(final int n, final int n2) {
        if (appTerminated) {
            return;
        }
        if (!Mobile.isPaused && MIDletLoader.MIDletSelected && !Mobile.isDoJa && Mobile.getDisplay() != null && (displayable = Mobile.getDisplay().getCurrent()) != null) {
            Mobile.getDisplay().postInputEvent(new Runnable(){

                @Override
                public void run() {
                    displayable.pointerDragged(n, n2);
                }
            });
        }
    }

    public static void pointerPressed(final int n, final int n2) {
        if (appTerminated) {
            return;
        }
        if (!Mobile.isPaused && MIDletLoader.MIDletSelected && !Mobile.isDoJa && Mobile.getDisplay() != null && (displayable = Mobile.getDisplay().getCurrent()) != null) {
            Mobile.getDisplay().postInputEvent(new Runnable(){

                @Override
                public void run() {
                    displayable.pointerPressed(n, n2);
                }
            });
        } else if (Mobile.isDoJa) {
            PointingDevice.setX(n);
            PointingDevice.setY(n2);
        }
    }

    public static void pointerReleased(final int n, final int n2) {
        if (appTerminated) {
            return;
        }
        if (!Mobile.isPaused && MIDletLoader.MIDletSelected && !Mobile.isDoJa && Mobile.getDisplay() != null && (displayable = Mobile.getDisplay().getCurrent()) != null) {
            Mobile.getDisplay().postInputEvent(new Runnable(){

                @Override
                public void run() {
                    displayable.pointerReleased(n, n2);
                }
            });
        } else if (Mobile.isDoJa) {
            PointingDevice.setX(-1);
            PointingDevice.setY(-1);
        }
    }

    private static void updateKeyState(int n, boolean bl) {
        int n2 = 0;
        switch (n) {
            case 50: {
                n2 = 2;
                break;
            }
            case 52: {
                n2 = 4;
                break;
            }
            case 54: {
                n2 = 32;
                break;
            }
            case 56: {
                n2 = 64;
                break;
            }
            case 53: {
                n2 = 256;
                break;
            }
            case 9: {
                n2 = 512;
                break;
            }
            case 10: {
                n2 = 1024;
                break;
            }
            case 11: {
                n2 = 2048;
                break;
            }
            case 12: {
                n2 = 4096;
                break;
            }
            case 1: {
                n2 = 2;
                break;
            }
            case 2: {
                n2 = 4;
                break;
            }
            case 5: {
                n2 = 32;
                break;
            }
            case 6: {
                n2 = 64;
                break;
            }
            case 8: {
                n2 = 256;
            }
        }
        keyState = bl ? (keyState |= n2) : (keyState ^= n2);
    }

    private static void updateVodafoneKeyState(int n, boolean bl) {
        int n2 = 0;
        switch (n) {
            case 1: {
                n2 = 4096;
                break;
            }
            case 2: {
                n2 = 8192;
                break;
            }
            case 5: {
                n2 = 16384;
                break;
            }
            case 6: {
                n2 = 32768;
                break;
            }
            case 8: {
                n2 = 65536;
                break;
            }
            case 48: {
                n2 = 1;
                break;
            }
            case 49: {
                n2 = 2;
                break;
            }
            case 50: {
                n2 = 4;
                break;
            }
            case 51: {
                n2 = 8;
                break;
            }
            case 52: {
                n2 = 16;
                break;
            }
            case 53: {
                n2 = 32;
                break;
            }
            case 54: {
                n2 = 64;
                break;
            }
            case 55: {
                n2 = 128;
                break;
            }
            case 56: {
                n2 = 256;
                break;
            }
            case 57: {
                n2 = 512;
                break;
            }
            case 42: {
                n2 = 1024;
                break;
            }
            case 35: {
                n2 = 2048;
                break;
            }
            case 126: {
                n2 = 131072;
                break;
            }
            case 127: {
                n2 = 262144;
                break;
            }
            default: {
                n2 = 0;
            }
        }
        vodafoneKeyState = bl ? (vodafoneKeyState |= n2) : (vodafoneKeyState ^= n2);
    }

    private static void updateDoJaKeyState(int n, boolean bl) {
        boolean bl2;
        int n2 = 0;
        int n3 = 0;
        switch (n) {
            case 1: {
                n2 = 131072;
                n3 = 17;
                break;
            }
            case 2: {
                n2 = 65536;
                n3 = 16;
                break;
            }
            case 5: {
                n2 = 262144;
                n3 = 18;
                break;
            }
            case 6: {
                n2 = 524288;
                n3 = 19;
                break;
            }
            case 8: {
                n2 = 0x100000;
                n3 = 20;
                break;
            }
            case 48: {
                n2 = 1;
                n3 = 0;
                break;
            }
            case 49: {
                n2 = 2;
                n3 = 1;
                break;
            }
            case 50: {
                n2 = 4;
                n3 = 2;
                break;
            }
            case 51: {
                n2 = 8;
                n3 = 3;
                break;
            }
            case 52: {
                n2 = 16;
                n3 = 4;
                break;
            }
            case 53: {
                n2 = 32;
                n3 = 5;
                break;
            }
            case 54: {
                n2 = 64;
                n3 = 6;
                break;
            }
            case 55: {
                n2 = 128;
                n3 = 7;
                break;
            }
            case 56: {
                n2 = 256;
                n3 = 8;
                break;
            }
            case 57: {
                n2 = 512;
                n3 = 9;
                break;
            }
            case 42: {
                n2 = 1024;
                n3 = 10;
                break;
            }
            case 35: {
                n2 = 2048;
                n3 = 11;
                break;
            }
            case 126: {
                n2 = 0x200000;
                n3 = 21;
                break;
            }
            case 127: {
                n2 = 0x400000;
                n3 = 22;
                break;
            }
            default: {
                n2 = 0;
            }
        }
        boolean bl3 = bl2 = Display.getCurrent() != null && Display.getCurrent() instanceof Canvas;
        if (bl) {
            doJaKeyState |= n2;
            if (bl2) {
                ((Canvas)Display.getCurrent()).processEvent(0, n3);
            }
        } else {
            if (bl2) {
                ((Canvas)Display.getCurrent()).processEvent(1, n3);
            }
            doJaKeyState ^= n2;
        }
    }

    private static boolean handleCommands(int n) {
        boolean bl = false;
        boolean bl2 = true;
        if (displayable instanceof javax.microedition.lcdui.Canvas) {
            bl = ((javax.microedition.lcdui.Canvas)displayable).getFullScreen();
            bl2 = false;
        }
        if (!bl && !MobilePlatform.displayable.commands.isEmpty() || bl2) {
            if (MobilePlatform.displayable.listCommands) {
                if (n == 50 || n == 1) {
                    --MobilePlatform.displayable.currentCommand;
                    if (MobilePlatform.displayable.currentCommand < 0) {
                        MobilePlatform.displayable.currentCommand = MobilePlatform.displayable.commands.size() - 1;
                    }
                    displayable._invalidate();
                    return true;
                }
                if (n == 56 || n == 6) {
                    ++MobilePlatform.displayable.currentCommand;
                    if (MobilePlatform.displayable.currentCommand >= MobilePlatform.displayable.commands.size()) {
                        MobilePlatform.displayable.currentCommand = 0;
                    }
                    displayable._invalidate();
                    return true;
                }
                if (n == 126) {
                    MobilePlatform.showCommandBar();
                    displayable.doLeftCommand();
                    return true;
                }
                if (n == 127) {
                    MobilePlatform.showCommandBar();
                    displayable.doRightCommand();
                    return true;
                }
            } else {
                boolean bl3 = displayable.screenKeyPressed(n);
                if (!bl3) {
                    if (n == 126) {
                        MobilePlatform.showCommandBar();
                        displayable.doLeftCommand();
                        return true;
                    }
                    if (n == 127) {
                        MobilePlatform.showCommandBar();
                        displayable.doRightCommand();
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public boolean load(String string) {
        Object object;
        Object object2;
        HashMap<String, String> hashMap;
        block35: {
            hashMap = new HashMap<String, String>();
            string = string.replaceAll("!", "%21");
            fileName = string;
            if (string.toLowerCase().contains(".kjx")) {
                try {
                    int n;
                    Object object3;
                    File file = new File(Mobile.tempKJXDir);
                    if (!file.isDirectory()) {
                        try {
                            file.mkdirs();
                        }
                        catch (Exception exception) {
                            Mobile.log((byte)4, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Failed to create KDDI temp dir:" + exception.getMessage());
                        }
                    }
                    File file2 = new File(new URI(string));
                    File file3 = null;
                    FileInputStream fileInputStream = new FileInputStream(file2);
                    DataInputStream dataInputStream = new DataInputStream(fileInputStream);
                    byte[] byArray = new byte[3];
                    dataInputStream.read(byArray, 0, 3);
                    if (!Arrays.equals(byArray, "KJX".getBytes())) {
                        throw new Exception("KJX Header string does not match: " + new String(byArray));
                    }
                    byte by = dataInputStream.readByte();
                    byte by2 = dataInputStream.readByte();
                    dataInputStream.skipBytes(by2);
                    int n2 = dataInputStream.readUnsignedShort();
                    byte by3 = dataInputStream.readByte();
                    byte[] byArray2 = new byte[by3];
                    dataInputStream.read(byArray2, 0, by3);
                    kjxJadFileName = new String(byArray2);
                    int n3 = 2048;
                    byte[] byArray3 = new byte[n3];
                    file3 = new File(Mobile.tempKJXDir, kjxJadFileName);
                    try {
                        int n4;
                        object3 = new FileOutputStream(file3);
                        for (n = n2; n > 0; n -= n4) {
                            n4 = dataInputStream.read(byArray3, 0, Math.min(n, n3));
                            ((FileOutputStream)object3).write(byArray3, 0, n4);
                        }
                        ((FileOutputStream)object3).close();
                    }
                    catch (Exception exception) {
                        Mobile.log((byte)4, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Failed to prepare kjx jad data: " + exception.getMessage());
                        return false;
                    }
                    try {
                        object3 = new FileInputStream(file3);
                        MIDletLoader.parseDescriptorInto((InputStream)object3, hashMap);
                        ((InputStream)object3).close();
                    }
                    catch (IOException iOException) {
                        Mobile.log((byte)4, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Failed to load kjx jad data: " + iOException.getMessage());
                        return false;
                    }
                    file3 = new File(Mobile.tempKJXDir, kjxJadFileName.substring(0, kjxJadFileName.length() - 4) + ".jar");
                    try {
                        object3 = new FileOutputStream(file3);
                        n = 0;
                        while ((n = dataInputStream.read(byArray3)) > 0) {
                            ((FileOutputStream)object3).write(byArray3, 0, n);
                        }
                        ((FileOutputStream)object3).close();
                    }
                    catch (Exception exception) {
                        Mobile.log((byte)4, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Failed to load kjx jar data: " + exception.getMessage());
                        return false;
                    }
                    object3 = file3.toURI().toURL();
                    this.loader = new MIDletLoader((URL)object3, hashMap);
                    if (Mobile.isDoJa) {
                        Mobile.textEncoding = "Shift_JIS";
                        MobilePlatform.checkFileEncoding();
                    }
                    Mobile.config.init(this.loader.suitename);
                    return true;
                }
                catch (Exception exception) {
                    Mobile.log((byte)2, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Couldn't load KJX file:" + exception.getMessage());
                    return false;
                }
            }
            if (string.toLowerCase().contains(".jar")) {
                try {
                    final File file = new File(new URI(string));
                    File file4 = file.getParentFile();
                    if (file4 == null || !file4.isDirectory() || (object2 = file4.listFiles((FilenameFilter)(object = new FilenameFilter(){

                        @Override
                        public boolean accept(File file2, String string) {
                            return string.equalsIgnoreCase(file.getName().replace(".jar", ".jad")) || string.equalsIgnoreCase(file.getName().replace(".jar", ".msd"));
                        }
                    }))) == null) break block35;
                    File[] fArrTmp = (File[])object2; for (File file5 : fArrTmp) {
                        if (!file5.exists() || file5.isDirectory()) continue;
                        if (file5.getName().toLowerCase().endsWith(".jad")) {
                            Mobile.log((byte)2, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Accompanying JAD found! Parsing additional MIDlet properties.");
                            string = file5.toURI().toString();
                        } else if (file5.getName().toLowerCase().endsWith(".msd")) {
                            Mobile.log((byte)2, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Accompanying MSD found! Parsing additional MIDlet properties.");
                            string = file5.toURI().toString();
                        }
                        break;
                    }
                }
                catch (Exception exception) {
                    Mobile.log((byte)2, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Couldn't check for accompanying JAD/MSD:" + exception.getMessage());
                }
            }
        }
        boolean bl = string.toLowerCase().endsWith(".msd");
        boolean bl2 = string.toLowerCase().endsWith(".jad");
        if (bl2 || bl) {
            if (bl) {
                Mobile.isSKT = true;
                Mobile.textEncoding = "EUC_KR";
                MobilePlatform.checkFileEncoding();
            }
            object = string.replace("file:", "").trim();
            try {
                object = URLDecoder.decode((String)object, Mobile.textEncoding);
            }
            catch (Exception exception) {
                System.err.println("Error decoding file name: " + exception.getMessage());
                return false;
            }
            object2 = null;
            try {
                object2 = new FileInputStream((String)object);
                try {
                    MIDletLoader.parseDescriptorInto((InputStream)object2, hashMap);
                }
                finally {
                    ((InputStream)object2).close();
                }
            }
            catch (IOException iOException) {
                Mobile.log((byte)4, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Failed to load descriptor data: " + iOException.getMessage());
                return false;
            }
            string = string.substring(0, string.lastIndexOf(46)) + ".jar";
        }
        try {
            object = new URL(string);
            this.loader = new MIDletLoader((URL)object, hashMap);
            if (Mobile.isDoJa) {
                Mobile.textEncoding = Mobile.supportedEncodings[1];
                MobilePlatform.checkFileEncoding();
            }
            Mobile.config.init(this.loader.suitename);
            return true;
        }
        catch (Exception exception) {
            Mobile.log((byte)4, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Failed to load Jar: " + exception.getMessage());
            exception.printStackTrace();
            return false;
        }
    }

    public void runJar() {
        try {
            if (Mobile.deleteTemporaryKJXFiles && kjxJadFileName != null) {
                File file = new File(Mobile.tempKJXDir, kjxJadFileName.substring(0, kjxJadFileName.length() - 4) + ".jar");
                file.delete();
                file = new File(Mobile.tempKJXDir, kjxJadFileName);
                file.delete();
            }
            Manager.prepareMediaEngine();
            this.loader.start();
        }
        catch (Exception exception) {
            Mobile.log((byte)4, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": Error Running Jar");
            exception.printStackTrace();
        }
    }

    public static void checkFileEncoding() {
        if (Boolean.getBoolean("freej2me.web")) {
            return;
        }
        if (!System.getProperty("file.encoding").equals(Mobile.textEncoding)) {
            Mobile.log((byte)2, MobilePlatform.class.getPackage().getName() + "." + MobilePlatform.class.getSimpleName() + ": different encoding: " + System.getProperty("file.encoding") + " while it should be " + Mobile.textEncoding + ". Restarting freeJ2ME to apply new encoding");
            Mobile.restartApp();
        }
    }

    public final void flushGraphics(PlatformImage platformImage, int n, int n2, int n3, int n4) {
        if (!Mobile.isPaused && !appTerminated) {
            // [PATCH-L1] Rate-limited paint heartbeat (1 line every 2s) — proves the
            // MIDlet loop is actually rendering; absence of ticks == real hang.
            Mobile.hbRate("paint", 2000L, n3 + "x" + n4);
            this.gcFrontbuffer.flushGraphics(platformImage, n, n2, n3, n4);
            if (postDraw != null) {
                postDraw.run();
                postDraw = null;
            }
            painter.run();
            if (focusCommandBar && (timeToUnfocus -= System.nanoTime() - this.lastRenderTime) <= 0L) {
                focusCommandBar = false;
            }
            Mobile.getPlatform().limitFps();
        }
    }

    public final void drawAppTerminated() {
        if (!isLibretro) {
            this.gcFrontbuffer.setColor(0, 0, 64);
            this.gcFrontbuffer.fillRect(0, 0, lcdWidth, lcdHeight);
            this.gcFrontbuffer.setColor(-20736);
            this.gcFrontbuffer.drawString("APP TERMINATED!", lcdWidth / 2, lcdHeight / 10, 1);
            this.gcFrontbuffer.drawString("Open a new one", lcdWidth / 2, lcdHeight / 10 + Font.getDefaultFont().getHeight() + 2, 1);
            this.gcFrontbuffer.drawString("through Drag-Drop", lcdWidth / 2, lcdHeight / 10 + 2 * Font.getDefaultFont().getHeight() + 2, 1);
            this.gcFrontbuffer.drawString("or 'File->Open'.", lcdWidth / 2, lcdHeight / 10 + 3 * Font.getDefaultFont().getHeight() + 2, 1);
        } else {
            this.gcFrontbuffer.setColor(0, 0, 0);
            this.gcFrontbuffer.fillRect(0, 0, lcdWidth, lcdHeight);
        }
        appTerminated = true;
        painter.run();
    }

    public void limitFps() {
        if (Mobile.limitFPS == 0 || pressedKeys[20]) {
            this.lastRenderTime = System.nanoTime();
            return;
        }
        this.requiredFrametime = 1000000000 / Mobile.limitFPS;
        this.elapsedTime = System.nanoTime() - this.lastRenderTime;
        this.sleepTime = this.requiredFrametime - this.elapsedTime;
        if (this.sleepTime > 0L) {
            LockSupport.parkNanos(this.sleepTime);
        }
        this.lastRenderTime = System.nanoTime();
    }

    public void setShowFPS(String string) {
        showFPS = string;
    }

    public static void showCommandBar() {
        focusCommandBar = true;
        timeToUnfocus = 3000000000L;
    }

    public void setPostFlushDraw(Runnable runnable) {
        postDraw = runnable;
    }

    static {
        showFPS = "Off";
        focusCommandBar = true;
        timeToUnfocus = 3000000000L;
        isLibretro = false;
        appTerminated = false;
        fileName = null;
        kjxJadFileName = null;
        keyState = 0;
        vodafoneKeyState = 0;
        doJaKeyState = 0;
        pressedKeys = new boolean[23];
    }
}

