/*
 * Decompiled with CFR 0.152.
 */
package org.recompile.freej2me;

import java.awt.Canvas;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Frame;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Toolkit;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.Transferable;
import java.awt.dnd.DropTarget;
import java.awt.dnd.DropTargetDragEvent;
import java.awt.dnd.DropTargetDropEvent;
import java.awt.dnd.DropTargetEvent;
import java.awt.dnd.DropTargetListener;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionAdapter;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.imageio.ImageIO;
import org.recompile.freej2me.AWTGUI;
import org.recompile.freej2me.ScreenShot;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

public class FreeJ2ME {
    private static boolean webMode = false;
    public static FreeJ2ME app;
    protected Frame main;
    private int lcdWidth;
    private int lcdHeight;
    private int scaleFactor = 1;
    private static final String extInputFilePath = "FreeJ2MEExternalKeyEvents.txt";
    private static final HashMap<String, Integer> extEventsMap;
    private static BufferedReader extEventReader;
    public static final Color freeJ2MEBGColor;
    public static final Color freeJ2MEDragColor;
    public static boolean isFullscreen;
    private LCD lcd;
    private int xborder;
    private int yborder;
    private AWTGUI awtGUI;

    public static void main(String[] stringArray) {
        System.out.println("==================================================================================");
        System.out.println("[ARENA-V8-FINAL] DEFINITIVE CORE V8 (ZERO LAG + WASD + KEYMAP BRIDGE) LOADED!");
        System.out.println("==================================================================================");
        // [PATCH-L1] Global uncaught-exception net so any silent thread death is visible
        // in the JS console (and hence in the runner /api/browser-log stream).
        try {
            Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
                @Override public void uncaughtException(Thread t, Throwable e) {
                    Mobile.hb("UNCAUGHT", "thread=" + t.getName() + " ex=" + e.getClass().getName() + ": " + e.getMessage());
                    try { e.printStackTrace(); } catch (Throwable ignored) {}
                }
            });
        } catch (Throwable ignored) {}
        Mobile.hb("main:enter", "argc=" + stringArray.length);
        ArrayList<String> arrayList = new ArrayList<String>();
        for (int i = 0; i < stringArray.length; ++i) {
            if (stringArray[i].equals("--web")) {
                webMode = true;
                continue;
            }
            if (stringArray[i].equals("--debugmodefreej2me")) {
                org.recompile.mobile.Mobile.debugMode = true;
                org.recompile.mobile.Mobile.dlog("Boot", "Debug mode ENABLED via --debugmodefreej2me flag");
                System.out.println("[DEBUG-MODE] --debugmodefreej2me activated. All dlog() calls will produce output.");
                continue;
            }
            arrayList.add(stringArray[i]);
        }
        stringArray = arrayList.toArray(new String[arrayList.size()]);
        if (!webMode && FreeJ2ME.looksLikeCheerpJMode5Args(stringArray)) {
            webMode = true;
        }
        if (webMode) {
            System.setProperty("freej2me.web", "true");
            System.setProperty("freej2me.systemPath", "/files/freej2me/freej2me_system");
            // [PATCH-L1] On web (CheerpJ) test build we ALWAYS want dlog() to fire —
            // otherwise silent hangs are invisible. Users can NOT disable it in web mode
            // because this build's only purpose is diagnostics. Comment out this line
            // for a "quiet" web build.
            if (!org.recompile.mobile.Mobile.debugMode) {
                org.recompile.mobile.Mobile.debugMode = true;
                Mobile.hb("Boot", "web mode detected → debugMode auto-ON");
            }
        }
        Mobile.hb("main:beforeClearOldLog", "");
        Mobile.clearOldLog();
        Mobile.hb("main:beforeNewFreeJ2ME", "webMode=" + webMode);
        app = new FreeJ2ME(stringArray);
        Mobile.hb("main:afterNewFreeJ2ME", "");
        try {
            FreeJ2ME.checkExtInputFile();
        }
        catch (IOException iOException) {
            Mobile.log((byte)4, FreeJ2ME.class.getPackage().getName() + "." + FreeJ2ME.class.getSimpleName() + ": Couldn't setup external input reader...");
        }
        Mobile.hb("main:exit", "");
    }

    private static boolean isIntegerString(String string) {
        if (string == null || string.length() == 0) {
            return false;
        }
        for (int i = 0; i < string.length(); ++i) {
            char c = string.charAt(i);
            if (i == 0 && c == '-' || c >= '0' && c <= '9') continue;
            return false;
        }
        return true;
    }

    private static int parseIntArg(String string, int n) {
        try {
            if (string == null || string.length() == 0) {
                return n;
            }
            return Integer.parseInt(string);
        }
        catch (Exception exception) {
            return n;
        }
    }

    private static boolean looksLikeCheerpJMode5Args(String[] stringArray) {
        return stringArray.length >= 4 && FreeJ2ME.isIntegerString(stringArray[1]) && FreeJ2ME.isIntegerString(stringArray[2]) && FreeJ2ME.isIntegerString(stringArray[3]) && !stringArray[1].equals("0") && !stringArray[1].equals("1");
    }

    private static void applyMode5CoreArg(String string) {
        if (string == null || string.length() == 0 || Mobile.config == null) {
            return;
        }
        String[] stringArray = string.split(";");
        for (int i = 0; i < stringArray.length; ++i) {
            int n;
            String string2 = stringArray[i].trim();
            if (string2.length() == 0 || (n = string2.indexOf(61)) <= 0) continue;
            String string3 = string2.substring(0, n).trim();
            String string4 = string2.substring(n + 1).trim();
            if (string3.startsWith("settings.")) {
                Mobile.config.settings.put(string3.substring(9), string4);
                continue;
            }
            if (!string3.startsWith("sysSettings.")) continue;
            Mobile.config.sysSettings.put(string3.substring(12), string4);
        }
    }

    private static void checkExtInputFile() throws IOException {
    }

    private static void readFile(String string) {
        try {
            String string2;
            extEventReader = new BufferedReader(new FileReader(string));
            while ((string2 = extEventReader.readLine()) != null) {
                String[] stringArray = string2.split(":");
                if (stringArray.length != 2) continue;
                String string3 = stringArray[0].trim();
                int n = Integer.parseInt(stringArray[1].trim());
                if (n == extEventsMap.get(string3)) continue;
                extEventsMap.replace(string3, n);
                FreeJ2ME.processExternalKey(string3, n);
            }
            extEventReader.close();
        }
        catch (IOException iOException) {
            iOException.printStackTrace();
        }
    }

    private static void processExternalKey(String string, int n) {
        int n2 = 0;
        if (string.equals("k1")) {
            n2 = 1;
        } else if (string.equals("k2")) {
            n2 = 2;
        } else if (string.equals("k3")) {
            n2 = 3;
        } else if (string.equals("k4")) {
            n2 = 4;
        } else if (string.equals("k5")) {
            n2 = 5;
        } else if (string.equals("k6")) {
            n2 = 6;
        } else if (string.equals("k7")) {
            n2 = 7;
        } else if (string.equals("k8")) {
            n2 = 8;
        } else if (string.equals("k9")) {
            n2 = 9;
        } else if (string.equals("k*")) {
            n2 = 10;
        } else if (string.equals("k#")) {
            n2 = 11;
        } else if (string.equals("ku")) {
            n2 = 12;
        } else if (string.equals("kd")) {
            n2 = 13;
        } else if (string.equals("kl")) {
            n2 = 14;
        } else if (string.equals("kr")) {
            n2 = 15;
        } else if (string.equals("kc")) {
            n2 = 16;
        } else if (string.equals("ls")) {
            n2 = 17;
        } else if (string.equals("rs")) {
            n2 = 18;
        } else if (string.equals("cl")) {
            n2 = 19;
        } else if (string.equals("ff")) {
            n2 = 20;
        } else if (string.equals("ro")) {
            n2 = 21;
        } else if (string.equals("pa")) {
            n2 = 22;
        }
        switch (n2) {
            case 0: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 96, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 96, '\uffff'));
                break;
            }
            case 1: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 97, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 97, '\uffff'));
                break;
            }
            case 2: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 104, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 104, '\uffff'));
                break;
            }
            case 3: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 99, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 99, '\uffff'));
                break;
            }
            case 4: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 100, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 100, '\uffff'));
                break;
            }
            case 5: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 101, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 101, '\uffff'));
                break;
            }
            case 6: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 102, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 102, '\uffff'));
                break;
            }
            case 7: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 103, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 103, '\uffff'));
                break;
            }
            case 8: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 98, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 98, '\uffff'));
                break;
            }
            case 9: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 105, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 105, '\uffff'));
                break;
            }
            case 10: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 69, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 69, '\uffff'));
                break;
            }
            case 11: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 82, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 82, '\uffff'));
                break;
            }
            case 12: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 38, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 38, '\uffff'));
                break;
            }
            case 13: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 40, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 40, '\uffff'));
                break;
            }
            case 14: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 37, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 37, '\uffff'));
                break;
            }
            case 15: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 39, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 39, '\uffff'));
                break;
            }
            case 16: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 10, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 10, '\uffff'));
                break;
            }
            case 17: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 81, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 81, '\uffff'));
                break;
            }
            case 18: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 87, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 87, '\uffff'));
                break;
            }
            case 19: {
                if (n == 1) {
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 65, '\uffff'), true);
                    break;
                }
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 65, '\uffff'));
                break;
            }
            case 20: {
                if (n == 1 && !Mobile.isFastForwarding) {
                    Mobile.isFastForwarding = true;
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 32, '\uffff'), true);
                    break;
                }
                if (n != 0 || !Mobile.isFastForwarding) break;
                Mobile.isFastForwarding = false;
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 32, '\uffff'));
                break;
            }
            case 21: {
                if (n != 1) break;
                int n3 = Mobile.rotateDisplay + 90;
                if (n3 == 360) {
                    n3 = 0;
                }
                Mobile.config.settings.put("rotate", "" + n3);
                app.settingsChanged();
                break;
            }
            case 22: {
                if (n == 1 && !Mobile.isPaused) {
                    Mobile.isPaused = true;
                    app.pressKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 88, '\uffff'), true);
                    break;
                }
                if (n != 0 || !Mobile.isPaused) break;
                Mobile.isPaused = false;
                app.releaseKey(new KeyEvent(FreeJ2ME.app.main, 401, System.currentTimeMillis(), 0, 88, '\uffff'));
            }
        }
    }

    public static void closeApp() {
        try {
            String string = System.getProperty("java.home") + "/bin/java";
            String string2 = System.getProperty("java.class.path");
            String[] stringArray = new String[]{string, "-Dfile.encoding=" + Mobile.textEncoding, "-cp", string2, FreeJ2ME.class.getName()};
            ProcessBuilder processBuilder = new ProcessBuilder(stringArray);
            processBuilder.start();
            System.exit(0);
        }
        catch (IOException iOException) {
            iOException.printStackTrace();
        }
    }

    public FreeJ2ME(String[] stringArray) {
        boolean bl = false;
        if (stringArray.length >= 1) {
            try {
                MobilePlatform.fileName = FreeJ2ME.getFormattedLocation(URLDecoder.decode(stringArray[0], Mobile.textEncoding));
            }
            catch (Exception exception) {
                // empty catch block
            }
        }
        if (webMode) {
            if (stringArray.length >= 3) {
                Mobile.lcdWidth = FreeJ2ME.parseIntArg(stringArray[1], Mobile.lcdWidth);
                Mobile.lcdHeight = FreeJ2ME.parseIntArg(stringArray[2], Mobile.lcdHeight);
            }
            if (stringArray.length >= 4) {
                this.scaleFactor = FreeJ2ME.parseIntArg(stringArray[3], this.scaleFactor);
            }
        } else {
            if (stringArray.length >= 2) {
                bl = FreeJ2ME.parseIntArg(stringArray[1], 0) == 1;
                boolean bl2 = bl;
            }
            if (stringArray.length >= 4) {
                Mobile.lcdWidth = FreeJ2ME.parseIntArg(stringArray[2], Mobile.lcdWidth);
                Mobile.lcdHeight = FreeJ2ME.parseIntArg(stringArray[3], Mobile.lcdHeight);
            }
            if (stringArray.length >= 5) {
                this.scaleFactor = FreeJ2ME.parseIntArg(stringArray[4], this.scaleFactor);
            }
        }
        this.lcdWidth = Mobile.lcdWidth;
        this.lcdHeight = Mobile.lcdHeight;
        Mobile.setPlatform(new MobilePlatform(this.lcdWidth, this.lcdHeight), new Runnable(){

            @Override
            public void run() {
                FreeJ2ME.this.settingsChanged();
            }
        });
        if (webMode) {
            Mobile.getPlatform().dataPath = "/files/freej2me/";
        }
        this.lcd = new LCD();
        this.lcd.setFocusable(true);
        this.awtGUI = new AWTGUI(Mobile.config);
        this.constructFreeJ2MEGUI();
        try {
            new Thread(new Runnable(){

                @Override
                public void run() {
                    try {
                        FreeJ2ME.nativeSetApplication(FreeJ2ME.this);
                    }
                    catch (Throwable throwable) {
                        // empty catch block
                    }
                }
            }, "Mode5InputBridge").start();
        }
        catch (Throwable throwable) {
            // empty catch block
        }
        if (MobilePlatform.fileName != null) {
            this.awtGUI.loadJarFile(MobilePlatform.fileName);
        }
        this.lcd.addKeyListener(new KeyListener(){

            @Override
            public void keyPressed(KeyEvent keyEvent) {
                FreeJ2ME.this.pressKey(keyEvent, false);
            }

            @Override
            public void keyReleased(KeyEvent keyEvent) {
                FreeJ2ME.this.releaseKey(keyEvent);
            }

            @Override
            public void keyTyped(KeyEvent keyEvent) {
            }
        });
        this.lcd.addMouseListener(new MouseListener(){

            @Override
            public void mousePressed(MouseEvent mouseEvent) {
                if (FreeJ2ME.this.awtGUI.hasLoadedFile()) {
                    int n = (int)((double)(mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                    int n2 = (int)((double)(mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    if (Mobile.rotateDisplay == 90) {
                        n = (int)((double)(mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                        n2 = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.cw - (mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    }
                    if (Mobile.rotateDisplay == 180) {
                        n = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.cw - (mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                        n2 = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.ch - (mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    }
                    if (Mobile.rotateDisplay == 270) {
                        n = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.ch - (mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                        n2 = (int)((double)(mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                    }
                    MobilePlatform.pointerPressed(n, n2);
                }
            }

            @Override
            public void mouseReleased(MouseEvent mouseEvent) {
                if (FreeJ2ME.this.awtGUI.hasLoadedFile()) {
                    int n = (int)((double)(mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                    int n2 = (int)((double)(mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    if (Mobile.rotateDisplay == 90) {
                        n = (int)((double)(mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                        n2 = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.cw - (mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    }
                    if (Mobile.rotateDisplay == 180) {
                        n = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.cw - (mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                        n2 = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.ch - (mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    }
                    if (Mobile.rotateDisplay == 270) {
                        n = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.ch - (mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                        n2 = (int)((double)(mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                    }
                    MobilePlatform.pointerReleased(n, n2);
                }
            }

            @Override
            public void mouseExited(MouseEvent mouseEvent) {
            }

            @Override
            public void mouseEntered(MouseEvent mouseEvent) {
            }

            @Override
            public void mouseClicked(MouseEvent mouseEvent) {
            }
        });
        this.lcd.addMouseMotionListener(new MouseMotionAdapter(){

            @Override
            public void mouseDragged(MouseEvent mouseEvent) {
                if (FreeJ2ME.this.awtGUI.hasLoadedFile()) {
                    int n = (int)((double)(mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                    int n2 = (int)((double)(mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    if (Mobile.rotateDisplay == 90) {
                        n = (int)((double)(mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                        n2 = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.cw - (mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    }
                    if (Mobile.rotateDisplay == 180) {
                        n = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.cw - (mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                        n2 = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.ch - (mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                    }
                    if (Mobile.rotateDisplay == 270) {
                        n = (int)((double)(((FreeJ2ME)FreeJ2ME.this).lcd.ch - (mouseEvent.getY() - ((FreeJ2ME)FreeJ2ME.this).lcd.cy)) * ((FreeJ2ME)FreeJ2ME.this).lcd.scaley);
                        n2 = (int)((double)(mouseEvent.getX() - ((FreeJ2ME)FreeJ2ME.this).lcd.cx) * ((FreeJ2ME)FreeJ2ME.this).lcd.scalex);
                    }
                    MobilePlatform.pointerDragged(n, n2);
                }
            }
        });
        this.displayGUI();
        Mobile.getPlatform().setPainter(new Runnable(){

            @Override
            public void run() {
                if (FreeJ2ME.this.awtGUI.hasJustLoaded()) {
                    FreeJ2ME.this.awtGUI.updateOptions();
                }
                if (FreeJ2ME.this.awtGUI.hasChanged()) {
                    FreeJ2ME.this.settingsChanged();
                    FreeJ2ME.this.awtGUI.clearChanged();
                }
                FreeJ2ME.this.lcd.repaint();
            }
        });
        if (stringArray.length < 1) {
            while (!this.awtGUI.hasLoadedFile()) {
                try {
                    Thread.sleep(1000L);
                }
                catch (InterruptedException interruptedException) {}
            }
        }
        if (Mobile.getPlatform().load(this.awtGUI.getJarPath())) {
            if (webMode) {
                if (stringArray.length >= 3) {
                    this.lcdWidth = FreeJ2ME.parseIntArg(stringArray[1], this.lcdWidth);
                    this.lcdHeight = FreeJ2ME.parseIntArg(stringArray[2], this.lcdHeight);
                    Mobile.config.settings.put("scrwidth", "" + this.lcdWidth);
                    Mobile.config.settings.put("scrheight", "" + this.lcdHeight);
                }
            } else if (stringArray.length >= 4) {
                this.lcdWidth = FreeJ2ME.parseIntArg(stringArray[2], this.lcdWidth);
                this.lcdHeight = FreeJ2ME.parseIntArg(stringArray[3], this.lcdHeight);
                Mobile.config.settings.put("scrwidth", "" + this.lcdWidth);
                Mobile.config.settings.put("scrheight", "" + this.lcdHeight);
            }
            if (stringArray.length >= 6) {
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 0) {
                    Mobile.config.settings.put("phone", "Standard");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 1) {
                    Mobile.config.settings.put("phone", "LG");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 2) {
                    Mobile.config.settings.put("phone", "Motorola");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 3) {
                    Mobile.config.settings.put("phone", "MotoTriplets");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 4) {
                    Mobile.config.settings.put("phone", "MotoV8");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 5) {
                    Mobile.config.settings.put("phone", "MotoA1000");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 6) {
                    Mobile.config.settings.put("phone", "NokiaKeyboard");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 7) {
                    Mobile.config.settings.put("phone", "Sagem");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 8) {
                    Mobile.config.settings.put("phone", "Siemens");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 9) {
                    Mobile.config.settings.put("phone", "Sharp");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 10) {
                    Mobile.config.settings.put("phone", "SKT");
                }
                if (FreeJ2ME.parseIntArg(stringArray[5], -1) == 11) {
                    Mobile.config.settings.put("phone", "KDDI");
                }
            }
            if (stringArray.length >= 7) {
                Mobile.config.settings.put("fps", "" + FreeJ2ME.parseIntArg(stringArray[6], 0) + "");
            }
            if (stringArray.length >= 8) {
                Mobile.config.settings.put("dojaversion", "" + FreeJ2ME.parseIntArg(stringArray[7], FreeJ2ME.parseIntArg(Mobile.config.settings.get("dojaversion"), 200)) + "");
            }
            if (webMode) {
                // Web/CheerpJ is much more sensitive to asynchronous repaint timing.
                // Default to immediate repaint in web mode to avoid white screens in games
                // that draw their first frame during setCurrent()/showNotify().
                Mobile.config.settings.put("compatimmediaterepaints", "on");
            }
            if (webMode && stringArray.length >= 5) {
                FreeJ2ME.applyMode5CoreArg(stringArray[4]);
            }
            this.settingsChanged();
            Mobile.getPlatform().runJar();
        } else {
            Mobile.log((byte)4, FreeJ2ME.class.getPackage().getName() + "." + FreeJ2ME.class.getSimpleName() + ": Couldn't load jar...");
        }
        if (bl) {
            this.toggleFullscreen();
        }
    }

    protected void pressKey(KeyEvent keyEvent, boolean bl) {
        if (this.awtGUI.hasLoadedFile()) {
            int n = keyEvent.getKeyCode();
            int n2 = this.getMobileKey(n);
            switch (n) {
                case 61: 
                case 107: {
                    if (isFullscreen) break;
                    ++this.scaleFactor;
                    this.main.setSize(this.lcdWidth * this.scaleFactor + this.xborder, this.lcdHeight * this.scaleFactor + this.yborder);
                    break;
                }
                case 45: 
                case 109: {
                    if (this.scaleFactor <= 1 || isFullscreen) break;
                    --this.scaleFactor;
                    this.main.setSize(this.lcdWidth * this.scaleFactor + this.xborder, this.lcdHeight * this.scaleFactor + this.yborder);
                    break;
                }
                case 70: {
                    if (!keyEvent.isAltDown() || !keyEvent.isControlDown()) break;
                    this.toggleFullscreen();
                    break;
                }
                case 82: {
                    if (!keyEvent.isAltDown() || !keyEvent.isControlDown()) break;
                    int n3 = Mobile.rotateDisplay + 90;
                    if (n3 == 360) {
                        n3 = 0;
                    }
                    Mobile.config.settings.put("rotate", "" + n3);
                    this.settingsChanged();
                }
            }
            if (n2 == Integer.MIN_VALUE) {
                return;
            }
            if (!MobilePlatform.pressedKeys[n2]) {
                if (n2 < 20) {
                    MobilePlatform.pressedKeys[n2] = true;
                    MobilePlatform.keyPressed(Mobile.getMobileKey(n2));
                } else if (keyEvent.isAltDown() && keyEvent.isControlDown() || bl) {
                    MobilePlatform.pressedKeys[n2] = true;
                }
            } else if (n2 < 20) {
                MobilePlatform.keyRepeated(Mobile.getMobileKey(n2));
            }
        }
    }

    protected void releaseKey(KeyEvent keyEvent) {
        if (this.awtGUI.hasLoadedFile()) {
            int n = this.getMobileKey(keyEvent.getKeyCode());
            if (n == Integer.MIN_VALUE) {
                return;
            }
            if (MobilePlatform.pressedKeys[n]) {
                MobilePlatform.pressedKeys[n] = false;
                MobilePlatform.keyReleased(Mobile.getMobileKey(n));
                if (n == 21) {
                    ScreenShot.takeScreenshot(false);
                } else if (n == 22) {
                    MobilePlatform.pauseResumeApp();
                }
                for (int i = 0; i < MobilePlatform.pressedKeys.length; ++i) {
                    if (!MobilePlatform.pressedKeys[i]) continue;
                    MobilePlatform.keyRepeated(Mobile.getMobileKey(i));
                }
            }
        }
    }

    private static String getFormattedLocation(String string) {
        if (string.startsWith("file://") || string.startsWith("http://") || string.startsWith("https://")) {
            return string;
        }
        File file = new File(string);
        if (!file.isFile()) {
            Mobile.log((byte)4, FreeJ2ME.class.getPackage().getName() + "." + FreeJ2ME.class.getSimpleName() + ": File not found...");
            System.exit(0);
        }
        return file.toURI().toString();
    }

    private void settingsChanged() {
        boolean bl = Mobile.updateSettings();
        if (Mobile.lcdWidth != this.lcdWidth || Mobile.lcdHeight != this.lcdHeight || bl) {
            Mobile.getPlatform().resizeLCD(Mobile.lcdWidth, Mobile.lcdHeight);
            if (Mobile.rotateDisplay == 0 || Mobile.rotateDisplay == 180) {
                this.lcdWidth = Mobile.lcdWidth;
                this.lcdHeight = Mobile.lcdHeight;
            } else {
                this.lcdWidth = Mobile.lcdHeight;
                this.lcdHeight = Mobile.lcdWidth;
            }
            this.resize();
            if (!isFullscreen) {
                this.main.setSize(this.lcdWidth * this.scaleFactor + this.xborder, this.lcdHeight * this.scaleFactor + this.yborder);
            }
            this.lcd.clearScreen();
        }
        this.awtGUI.updateOptions();
    }

    private int getMobileKey(int n) {
        switch (n) {
            case 38: 
            case 87: {
                return 0;
            }
            case 40: 
            case 83: {
                return 1;
            }
            case 37: 
            case 65: {
                return 2;
            }
            case 39: 
            case 68: {
                return 3;
            }
            case 10: 
            case 32: 
            case 74: 
            case 75: {
                return 7;
            }
            case 81: 
            case 112: 
            case 122: {
                return 9;
            }
            case 69: 
            case 99: 
            case 113: {
                return 8;
            }
            case 49: 
            case 97: {
                return 10;
            }
            case 50: 
            case 98: {
                return 14;
            }
            case 51: 
            case 105: {
                return 11;
            }
            case 52: 
            case 100: {
                return 15;
            }
            case 53: 
            case 101: {
                return 18;
            }
            case 54: 
            case 102: {
                return 16;
            }
            case 55: 
            case 103: {
                return 5;
            }
            case 56: 
            case 104: {
                return 17;
            }
            case 57: {
                return 4;
            }
            case 48: 
            case 96: {
                return 6;
            }
            case 42: 
            case 88: {
                return 12;
            }
            case 35: 
            case 82: {
                return 13;
            }
            case 8: {
                return 19;
            }
        }
        return Integer.MIN_VALUE;
    }

    private void resize() {
        this.xborder = this.main.getInsets().left + this.main.getInsets().right;
        this.yborder = this.main.getInsets().top + this.main.getInsets().bottom;
        double d = (this.main.getWidth() - this.xborder) * 1;
        double d2 = (this.main.getHeight() - this.yborder) * 1;
        double d3 = this.lcdWidth;
        double d4 = this.lcdHeight;
        d3 = d;
        d4 = d3 * ((double)this.lcdHeight / (double)this.lcdWidth);
        if (d4 > d2) {
            d4 = d2;
            d3 = d4 * ((double)this.lcdWidth / (double)this.lcdHeight);
        }
        this.lcd.updateScale((int)d3, (int)d4);
    }

    public void toggleFullscreen() {
        isFullscreen = !isFullscreen;
        this.main.dispose();
        this.constructFreeJ2MEGUI();
        this.displayGUI();
    }

    private void constructFreeJ2MEGUI() {
        this.main = new Frame("FreeJ2ME-Plus");
        if (webMode) {
            this.main.setUndecorated(true);
            this.main.setResizable(false);
            this.main.setSize(this.lcdWidth * this.scaleFactor, this.lcdHeight * this.scaleFactor);
        } else if (isFullscreen) {
            this.main.setUndecorated(true);
            this.main.setSize(Toolkit.getDefaultToolkit().getScreenSize());
        } else {
            this.main.setSize(350, 450);
            this.main.setMinimumSize(new Dimension(192, 64));
            this.main.setLocationRelativeTo(null);
        }
        this.main.setBackground(Color.BLACK);
        try {
            this.main.setIconImage(ImageIO.read(this.main.getClass().getResourceAsStream("/org/recompile/icon.png")));
        }
        catch (Exception exception) {
            // empty catch block
        }
        this.main.addWindowListener(new WindowAdapter(){

            @Override
            public void windowClosing(WindowEvent windowEvent) {
                System.exit(0);
            }
        });
        this.main.add(this.lcd);
        this.awtGUI.setMainFrame(this.main);
        if (!webMode && !isFullscreen) {
            this.main.setMenuBar(this.awtGUI.getMenuBar());
        }
    }

    private void displayGUI() {
        this.main.addComponentListener(new ComponentAdapter(){

            @Override
            public void componentResized(ComponentEvent componentEvent) {
                FreeJ2ME.this.resize();
            }
        });
        this.main.setVisible(true);
        if (webMode) {
            this.main.setSize(this.lcdWidth * this.scaleFactor, this.lcdHeight * this.scaleFactor);
            this.lcd.setSize(this.lcdWidth * this.scaleFactor, this.lcdHeight * this.scaleFactor);
            this.resize();
            this.lcd.requestFocus();
            this.lcd.requestFocusInWindow();
        } else {
            this.main.pack();
            this.resize();
            if (!isFullscreen) {
                this.main.setSize(this.lcdWidth * this.scaleFactor + this.xborder, this.lcdHeight * this.scaleFactor + this.yborder);
            }
            this.awtGUI.updateDialogs();
        }
    }

    public static native void nativeSetApplication(FreeJ2ME var0);

    public void virtualKeyFromJS(int n, boolean bl) {
        int n2 = this.mapVirtualMidpCode(n);
        if (n2 == Integer.MIN_VALUE) {
            return;
        }
        try {
            if (bl) {
                MobilePlatform.keyPressed(n2);
            } else {
                MobilePlatform.keyReleased(n2);
            }
        }
        catch (Throwable throwable) {
            // empty catch block
        }
    }

    private int mapVirtualMidpCode(int n) {
        switch (n) {
            case -1: {
                return -1;
            }
            case -2: {
                return -2;
            }
            case -3: {
                return -3;
            }
            case -4: {
                return -4;
            }
            case -5: {
                return -5;
            }
            case -6: {
                return -6;
            }
            case -7: {
                return -7;
            }
            case 48: {
                return 48;
            }
            case 49: {
                return 49;
            }
            case 50: {
                return 50;
            }
            case 51: {
                return 51;
            }
            case 52: {
                return 52;
            }
            case 53: {
                return 53;
            }
            case 54: {
                return 54;
            }
            case 55: {
                return 55;
            }
            case 56: {
                return 56;
            }
            case 57: {
                return 57;
            }
            case 42: {
                return 42;
            }
            case 35: {
                return 35;
            }
            case 122: {
                return 55;
            }
            case 99: {
                return 57;
            }
        }
        return Integer.MIN_VALUE;
    }

    static {
        extEventsMap = new HashMap();
        extEventsMap.put("k0", 0);
        extEventsMap.put("k1", 0);
        extEventsMap.put("k2", 0);
        extEventsMap.put("k3", 0);
        extEventsMap.put("k4", 0);
        extEventsMap.put("k5", 0);
        extEventsMap.put("k6", 0);
        extEventsMap.put("k7", 0);
        extEventsMap.put("k8", 0);
        extEventsMap.put("k9", 0);
        extEventsMap.put("k*", 0);
        extEventsMap.put("k#", 0);
        extEventsMap.put("ku", 0);
        extEventsMap.put("kd", 0);
        extEventsMap.put("kl", 0);
        extEventsMap.put("kr", 0);
        extEventsMap.put("kc", 0);
        extEventsMap.put("ls", 0);
        extEventsMap.put("rs", 0);
        extEventsMap.put("cl", 0);
        extEventsMap.put("ff", 0);
        extEventsMap.put("ro", 0);
        extEventsMap.put("pa", 0);
        freeJ2MEBGColor = new Color(0, 0, 64, 255);
        freeJ2MEDragColor = new Color(55, 55, 125, 255);
        isFullscreen = false;
    }

    private class LCD
    extends Canvas {
        private boolean showDragMessage = false;
        private boolean fileSupported = false;
        public int cx = 0;
        public int cy = 0;
        public int cw = 240;
        public int ch = 320;
        public double scalex = 1.0;
        public double scaley = 1.0;

        public LCD() {
            if (!webMode) {
                this.setDropTarget();
            }
            this.setBackground(Color.WHITE);
        }

        public void updateScale(int n, int n2) {
            this.cx = (this.getWidth() - n) / 2;
            this.cy = (this.getHeight() - n2) / 2;
            this.cw = n;
            this.ch = n2;
            this.scalex = (double)FreeJ2ME.this.lcdWidth / (double)n;
            this.scaley = (double)FreeJ2ME.this.lcdHeight / (double)n2;
        }

        @Override
        public void update(Graphics graphics) {
            this.paint(graphics);
        }

        public void clearScreen() {
            ((Graphics2D)this.getGraphics()).clearRect(0, 0, this.getWidth(), this.getHeight());
        }

        @Override
        public void paint(Graphics graphics) {
            if (((FreeJ2ME)FreeJ2ME.this).awtGUI.awtDialogs[2].isVisible()) {
                FreeJ2ME.this.awtGUI.updateDialogs();
            }
            if (!this.showDragMessage) {
                if (!FreeJ2ME.this.awtGUI.hasLoadedFile()) {
                    graphics.setColor(Color.BLACK);
                    graphics.fillRect(0, 0, this.getWidth(), this.getHeight());
                    graphics.drawImage(FreeJ2ME.this.main.getIconImage(), this.getWidth() / 2 - FreeJ2ME.this.main.getIconImage().getWidth(null) / 2, this.getHeight() / 2 - FreeJ2ME.this.main.getIconImage().getHeight(null) / 2, Math.min(this.getWidth(), FreeJ2ME.this.main.getIconImage().getWidth(null)), Math.min(this.getHeight(), FreeJ2ME.this.main.getIconImage().getHeight(null)), null);
                    graphics.setColor(new Color(55, 55, 125, 238));
                    graphics.fillRect(0, 0, this.getWidth(), this.getHeight());
                    graphics.setColor(Color.ORANGE);
                    graphics.setFont(new Font("Dialog", 3, 24));
                    String string = "FreeJ2ME-Plus V1.53";
                    FontMetrics fontMetrics = graphics.getFontMetrics();
                    graphics.drawString(string, (this.getWidth() - fontMetrics.stringWidth(string)) / 2, this.getHeight() / 2 - fontMetrics.getHeight());
                    graphics.setFont(new Font("Dialog", 1, 16));
                    string = "Please use the 'File' menu";
                    fontMetrics = graphics.getFontMetrics();
                    graphics.drawString(string, (this.getWidth() - fontMetrics.stringWidth(string)) / 2, this.getHeight() / 2);
                    string = "or drop a valid J2ME app";
                    fontMetrics = graphics.getFontMetrics();
                    graphics.drawString(string, (this.getWidth() - fontMetrics.stringWidth(string)) / 2, this.getHeight() / 2 + fontMetrics.getHeight());
                    string = "inside this window.";
                    fontMetrics = graphics.getFontMetrics();
                    graphics.drawString(string, (this.getWidth() - fontMetrics.stringWidth(string)) / 2, this.getHeight() / 2 + fontMetrics.getHeight() * 2);
                    return;
                }
                if (Mobile.isPaused) {
                    Mobile.getPlatform().getLcdFrontbufferGraphics().drawPauseIndicator();
                } else if (MobilePlatform.pressedKeys[20]) {
                    Mobile.getPlatform().getLcdFrontbufferGraphics().drawFastForwardIndicator();
                }
                if (Mobile.rotateDisplay == 0) {
                    graphics.drawImage(Mobile.getPlatform().getLcdFrontbuffer().getCanvas(), this.cx, this.cy, this.cw, this.ch, null);
                } else if (Mobile.rotateDisplay == 90) {
                    ((Graphics2D)graphics).rotate(Math.toRadians(90.0), this.cw / 2, this.cw / 2);
                    graphics.drawImage(Mobile.getPlatform().getLcdFrontbuffer().getCanvas(), 0, this.cx, this.ch, this.cw, null);
                } else if (Mobile.rotateDisplay == 180) {
                    ((Graphics2D)graphics).rotate(Math.toRadians(180.0), this.cw / 2, this.ch / 2);
                    graphics.drawImage(Mobile.getPlatform().getLcdFrontbuffer().getCanvas(), -this.cx, this.cy, this.cw, this.ch, null);
                } else if (Mobile.rotateDisplay == 270) {
                    ((Graphics2D)graphics).rotate(Math.toRadians(270.0), this.ch / 2, this.ch / 2);
                    graphics.drawImage(Mobile.getPlatform().getLcdFrontbuffer().getCanvas(), 0, this.cx, this.ch, this.cw, null);
                }
            } else {
                graphics.setColor(freeJ2MEDragColor);
                graphics.fillRect(this.cx, this.cy, this.cw, this.ch);
                graphics.setFont(new Font("Dialog", 1, 20));
                graphics.setColor(this.fileSupported ? Color.ORANGE : Color.RED);
                String string = this.fileSupported ? ">> DROP HERE <<" : "INVALID FILE TYPE!!!";
                FontMetrics fontMetrics = graphics.getFontMetrics();
                int n = (this.getWidth() - fontMetrics.stringWidth(string)) / 2;
                int n2 = this.getHeight() / 2;
                graphics.drawString(string, n, n2);
            }
        }

        private void setDropTarget() {
            new DropTarget(this, new DropTargetListener(){

                @Override
                public void dragEnter(DropTargetDragEvent dropTargetDragEvent) {
                    block5: {
                        try {
                            if (dropTargetDragEvent.isDataFlavorSupported(DataFlavor.javaFileListFlavor)) {
                                Transferable transferable = dropTargetDragEvent.getTransferable();
                                List<File> list = (List<File>)transferable.getTransferData(DataFlavor.javaFileListFlavor);
                                for (File file : list) {
                                    if (LCD.this.isSupportedFile(file.getName())) {
                                        dropTargetDragEvent.acceptDrag(1);
                                        LCD.this.fileSupported = true;
                                        break block5;
                                    }
                                    dropTargetDragEvent.rejectDrag();
                                    LCD.this.fileSupported = false;
                                }
                                break block5;
                            }
                            dropTargetDragEvent.rejectDrag();
                        }
                        catch (Exception exception) {
                            exception.printStackTrace();
                        }
                    }
                    LCD.this.showDragMessage = true;
                    LCD.this.repaint();
                }

                @Override
                public void dragOver(DropTargetDragEvent dropTargetDragEvent) {
                }

                @Override
                public void dropActionChanged(DropTargetDragEvent dropTargetDragEvent) {
                }

                @Override
                public void dragExit(DropTargetEvent dropTargetEvent) {
                    LCD.this.showDragMessage = false;
                    LCD.this.repaint();
                }

                /*
                 * WARNING - Removed try catching itself - possible behaviour change.
                 */
                @Override
                public void drop(DropTargetDropEvent dropTargetDropEvent) {
                    try {
                        List list;
                        dropTargetDropEvent.acceptDrop(1);
                        Transferable transferable = dropTargetDropEvent.getTransferable();
                        if (transferable.isDataFlavorSupported(DataFlavor.javaFileListFlavor) && !(list = (List)transferable.getTransferData(DataFlavor.javaFileListFlavor)).isEmpty() && LCD.this.fileSupported) {
                            if (!FreeJ2ME.this.awtGUI.hasLoadedFile()) {
                                FreeJ2ME.this.awtGUI.loadJarFile(((File)list.get(0)).toURI().toString());
                            } else {
                                MobilePlatform.fileName = ((File)list.get(0)).toURI().toString();
                                FreeJ2ME.this.awtGUI.showRestartDialog();
                            }
                        }
                    }
                    catch (Exception exception) {
                        System.out.println("Exception caught in Drag and Drop:" + exception.getMessage());
                    }
                    finally {
                        dropTargetDropEvent.dropComplete(true);
                        LCD.this.showDragMessage = false;
                        LCD.this.repaint();
                    }
                }
            });
        }

        private boolean isSupportedFile(String string) {
            return string.toLowerCase().endsWith(".jar") || string.toLowerCase().endsWith(".jad") || string.toLowerCase().endsWith(".kjx");
        }
    }
}

