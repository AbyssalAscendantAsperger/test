/*
 * Decompiled with CFR 0.152.
 */
package org.recompile.mobile;

import com.nttdocomo.ui.IApplication;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.LinkedList;
import java.util.Queue;
import java.util.jar.Attributes;
import java.util.jar.JarFile;
import java.util.jar.Manifest;
import javax.microedition.lcdui.Display;
import javax.microedition.media.Manager;
import javax.microedition.midlet.MIDlet;
import org.recompile.freej2me.Config;
import org.recompile.mobile.MobilePlatform;
import org.recompile.mobile.PlatformFont;

public class Mobile {
    private static MobilePlatform platform;
    public static File logFile;
    private static BufferedWriter logWriter;
    private static final Queue<Runnable> pendingLogs;
    public static final String[] supportedEncodings;
    public static final byte ISO_8859_1 = 0;
    public static final byte SHIFT_JIS = 1;
    public static final byte EUC_KR = 2;
    public static String textEncoding;
    private static Display display;
    public static MIDlet midlet;
    public static IApplication iAppli;
    public static boolean isDoJa;
    public static boolean isKDDI;
    public static boolean isSKT;
    public static int DoJaVersion;
    public static boolean usingMessagingAPI;
    public static boolean noAlphaOnBlankImages;
    public static boolean halfResM3GRaster;
    public static boolean halfResMCV3Raster;
    public static boolean MCV3NoLighting;
    public static Config config;
    public static int lcdWidth;
    public static int lcdHeight;
    public static int rotateDisplay;
    public static boolean useCustomMidi;
    public static boolean useCustomTextFont;
    public static byte fontSizeOffset;
    public static boolean dumpAudioStreams;
    public static boolean dumpGraphicsObjects;
    private static final String LOG_FILE;
    public static final String SIEMENS_DATA_PATH;
    public static final String XCE_DATA_PATH;
    public static byte minLogLevel;
    public static final byte LOG_NONE = 0;
    public static final byte LOG_DEBUG = 1;
    public static final byte LOG_INFO = 2;
    public static final byte LOG_WARNING = 3;
    public static final byte LOG_ERROR = 4;
    public static final byte LOG_FATAL = 5;
    public static final String tempKJXDir;
    public static boolean deleteTemporaryKJXFiles;
    public static int lcduiBGColor;
    public static int lcduiStrokeColor;
    public static int lcduiTextColor;
    public static int[] lcdMaskColors;
    public static int maskIndex;
    public static boolean renderLCDMask;
    public static boolean funLightsEnabled;
    public static int[] funLightRegionColor;
    public static byte funLightRegionSize;
    public static boolean compatFantasyZoneFix;
    public static boolean compatTranslateToOriginOnReset;
    public static boolean compatImmediateRepaints;
    public static boolean compatOverridePlatformChecks;
    public static boolean compatSiemensFriendlyDrawing;
    public static boolean compatIgnoreVolumeChanges;
    public static boolean compatMCV3HorizontalFovFix;
    public static boolean M3GRenderUntexturedPolygons;
    public static boolean M3GRenderWireframe;
    public static boolean MCV3ShowTimeMetrics;
    public static boolean MCV3ShowHeapUsage;
    public static boolean kddi;
    public static boolean lg;
    public static boolean motorola;
    public static boolean motoV8;
    public static boolean motoTriplets;
    public static boolean motoA1000;
    public static boolean nokiaKeyboard;
    public static boolean sagem;
    public static boolean siemens;
    public static boolean sharp;
    public static boolean skt;
    private static final int[] awtguiKeycodes;
    private static final int[] sdlguiKeycodes;
    private static final String[] keyArray;
    public static boolean sound;
    public static boolean audioSafe;
    public static float audioGainDb;
    public static int audioSampleRate;
    public static int audioMaxSfx;
    public static float audioToneVolumeScale;
    public static float audioSmafPcmGainMaxDb;
    public static int activeSfxCount;
    public static int limitFPS;
    public static byte unlockFramerateHack;
    public static boolean isFastForwarding;
    public static boolean isPaused;
    public static volatile float fastForwardMultiplier;
    public static byte libretroRestartRequested;
    public static byte libretroEncodingRequested;
    public static boolean isAAEnabled;
    public static int vibrationDuration;
    public static int vibrationStrength;
    public static final int KDDI_UP = 1;
    public static final int KDDI_DOWN = 6;
    public static final int KDDI_LEFT = 2;
    public static final int KDDI_RIGHT = 5;
    public static final int KDDI_SOFT1 = 20;
    public static final int KDDI_SOFT2 = 21;
    public static final int KDDI_FIRE = 8;
    public static final int KDDI_CLR = 8;
    public static final int LG_UP = -1;
    public static final int LG_DOWN = -2;
    public static final int LG_LEFT = -3;
    public static final int LG_RIGHT = -4;
    public static final int LG_SOFT1 = -202;
    public static final int LG_SOFT2 = -203;
    public static final int LG_FIRE = -5;
    public static final int LG_CLR = -204;
    public static final int MOTOROLA_UP = -1;
    public static final int MOTOROLA_DOWN = -6;
    public static final int MOTOROLA_LEFT = -2;
    public static final int MOTOROLA_RIGHT = -5;
    public static final int MOTOROLA_SOFT1 = -21;
    public static final int MOTOROLA_SOFT2 = -22;
    public static final int MOTOROLA_FIRE = -20;
    public static final int MOTOV8_UP = -1;
    public static final int MOTOV8_DOWN = -2;
    public static final int MOTOV8_LEFT = -3;
    public static final int MOTOV8_RIGHT = -4;
    public static final int MOTOV8_SOFT1 = -21;
    public static final int MOTOV8_SOFT2 = -22;
    public static final int MOTOV8_FIRE = -5;
    public static final int TRIPLETS_UP = 1;
    public static final int TRIPLETS_DOWN = 6;
    public static final int TRIPLETS_LEFT = 2;
    public static final int TRIPLETS_RIGHT = 5;
    public static final int TRIPLETS_SOFT1 = 21;
    public static final int TRIPLETS_SOFT2 = 22;
    public static final int TRIPLETS_FIRE = 20;
    public static final int A1000_UP = -1;
    public static final int A1000_DOWN = -2;
    public static final int A1000_LEFT = -3;
    public static final int A1000_RIGHT = -4;
    public static final int A1000_SOFT1 = -10;
    public static final int A1000_SOFT2 = -11;
    public static final int A1000_FIRE = 13;
    public static final int NOKIA_UP = -1;
    public static final int NOKIA_DOWN = -2;
    public static final int NOKIA_LEFT = -3;
    public static final int NOKIA_RIGHT = -4;
    public static final int NOKIA_SOFT1 = -6;
    public static final int NOKIA_SOFT2 = -7;
    public static final int NOKIA_SOFT3 = -5;
    public static final int NOKIA_END = -11;
    public static final int NOKIA_SEND = -10;
    public static final int NOKIAKB_UP = -1;
    public static final int NOKIAKB_DOWN = -2;
    public static final int NOKIAKB_LEFT = -3;
    public static final int NOKIAKB_RIGHT = -4;
    public static final int NOKIAKB_SOFT1 = -6;
    public static final int NOKIAKB_SOFT2 = -7;
    public static final int NOKIAKB_SOFT3 = -5;
    public static final int NOKIAKB_NUM0 = 109;
    public static final int NOKIAKB_NUM1 = 114;
    public static final int NOKIAKB_NUM2 = 116;
    public static final int NOKIAKB_NUM3 = 121;
    public static final int NOKIAKB_NUM4 = 102;
    public static final int NOKIAKB_NUM5 = 103;
    public static final int NOKIAKB_NUM6 = 104;
    public static final int NOKIAKB_NUM7 = 118;
    public static final int NOKIAKB_NUM8 = 98;
    public static final int NOKIAKB_NUM9 = 110;
    public static final int NOKIAKB_STAR = 117;
    public static final int NOKIAKB_POUND = 106;
    public static final int SAGEM_UP = -1;
    public static final int SAGEM_DOWN = -2;
    public static final int SAGEM_LEFT = -3;
    public static final int SAGEM_RIGHT = -4;
    public static final int SAGEM_SOFT1 = -7;
    public static final int SAGEM_SOFT2 = -6;
    public static final int SAGEM_SOFT3 = -5;
    public static final int SHARP_UP = 1;
    public static final int SHARP_DOWN = 6;
    public static final int SHARP_LEFT = 2;
    public static final int SHARP_RIGHT = 5;
    public static final int SHARP_SOFT1 = 21;
    public static final int SHARP_SOFT2 = 22;
    public static final int SHARP_FIRE = 20;
    public static final int SIEMENS_UP = -59;
    public static final int SIEMENS_DOWN = -60;
    public static final int SIEMENS_LEFT = -61;
    public static final int SIEMENS_RIGHT = -62;
    public static final int SIEMENS_SOFT1 = -1;
    public static final int SIEMENS_SOFT2 = -4;
    public static final int SIEMENS_FIRE = -26;

    public static MobilePlatform getPlatform() {
        return platform;
    }

    public static void setPlatform(MobilePlatform mobilePlatform, Runnable runnable) {
        platform = mobilePlatform;
        config = new Config();
        Mobile.config.onChange = runnable;
    }

    public static Display getDisplay() {
        return display;
    }

    public static void setDisplay(Display display) {
        Mobile.display = display;
    }

    public static InputStream getResourceAsStream(Class clazz, String string) {
        return Mobile.platform.loader.getMIDletResourceAsStream(string);
    }

    public static InputStream getMIDletResourceAsStream(String string) {
        return Mobile.platform.loader.getMIDletResourceAsStream(string);
    }

    public static byte[] getMIDletResourceAsByteArray(String string) {
        return Mobile.platform.loader.getMIDletResourceAsByteArray(string);
    }

    public static final int convertSDLKeycode(int n) {
        return sdlguiKeycodes[n];
    }

    public static final int convertAWTKeycode(int n) {
        return awtguiKeycodes[n];
    }

    public static final int getMobileKey(int n) {
        if (kddi) {
            switch (n) {
                case 0: {
                    return 1;
                }
                case 1: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 3: {
                    return 5;
                }
                case 7: {
                    return 8;
                }
                case 8: {
                    return 21;
                }
                case 9: {
                    return 20;
                }
                case 19: {
                    return 8;
                }
            }
        }
        if (lg) {
            switch (n) {
                case 0: {
                    return -1;
                }
                case 1: {
                    return -2;
                }
                case 2: {
                    return -3;
                }
                case 3: {
                    return -4;
                }
                case 7: {
                    return -5;
                }
                case 8: {
                    return -203;
                }
                case 9: {
                    return -202;
                }
                case 19: {
                    return -204;
                }
            }
        }
        if (motorola) {
            switch (n) {
                case 0: {
                    return -1;
                }
                case 1: {
                    return -6;
                }
                case 2: {
                    return -2;
                }
                case 3: {
                    return -5;
                }
                case 7: {
                    return -20;
                }
                case 8: {
                    return -22;
                }
                case 9: {
                    return -21;
                }
            }
        }
        if (motoTriplets) {
            switch (n) {
                case 0: {
                    return 1;
                }
                case 1: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 3: {
                    return 5;
                }
                case 7: {
                    return 20;
                }
                case 8: {
                    return 22;
                }
                case 9: {
                    return 21;
                }
            }
        }
        if (motoV8) {
            switch (n) {
                case 0: {
                    return -1;
                }
                case 1: {
                    return -2;
                }
                case 2: {
                    return -3;
                }
                case 3: {
                    return -4;
                }
                case 7: {
                    return -5;
                }
                case 8: {
                    return -22;
                }
                case 9: {
                    return -21;
                }
            }
        }
        if (motoA1000) {
            switch (n) {
                case 0: {
                    return -1;
                }
                case 1: {
                    return -2;
                }
                case 2: {
                    return -3;
                }
                case 3: {
                    return -4;
                }
                case 7: {
                    return 13;
                }
                case 8: {
                    return -11;
                }
                case 9: {
                    return -10;
                }
            }
        }
        if (nokiaKeyboard) {
            switch (n) {
                case 0: {
                    return -1;
                }
                case 1: {
                    return -2;
                }
                case 2: {
                    return -3;
                }
                case 3: {
                    return -4;
                }
                case 4: {
                    return 110;
                }
                case 5: {
                    return 118;
                }
                case 6: {
                    return 109;
                }
                case 7: {
                    return -5;
                }
                case 8: {
                    return -7;
                }
                case 9: {
                    return -6;
                }
                case 10: {
                    return 114;
                }
                case 11: {
                    return 121;
                }
                case 12: {
                    return 117;
                }
                case 13: {
                    return 106;
                }
                case 14: {
                    return 116;
                }
                case 15: {
                    return 102;
                }
                case 16: {
                    return 104;
                }
                case 17: {
                    return 98;
                }
                case 18: {
                    return 103;
                }
            }
        }
        if (sagem) {
            switch (n) {
                case 0: {
                    return -1;
                }
                case 1: {
                    return -2;
                }
                case 2: {
                    return -3;
                }
                case 3: {
                    return -4;
                }
                case 7: {
                    return -5;
                }
                case 8: {
                    return -6;
                }
                case 9: {
                    return -7;
                }
            }
        }
        if (siemens) {
            switch (n) {
                case 0: {
                    return -59;
                }
                case 1: {
                    return -60;
                }
                case 2: {
                    return -61;
                }
                case 3: {
                    return -62;
                }
                case 7: {
                    return -26;
                }
                case 8: {
                    return -4;
                }
                case 9: {
                    return -1;
                }
            }
        }
        if (sharp) {
            switch (n) {
                case 0: {
                    return 1;
                }
                case 1: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 3: {
                    return 5;
                }
                case 7: {
                    return 20;
                }
                case 8: {
                    return 22;
                }
                case 9: {
                    return 21;
                }
            }
        }
        if (skt) {
            switch (n) {
                case 0: {
                    return 141;
                }
                case 1: {
                    return 146;
                }
                case 2: {
                    return 142;
                }
                case 3: {
                    return 145;
                }
                case 7: {
                    return 148;
                }
                case 8: {
                    return 129;
                }
                case 9: {
                    return 131;
                }
                case 19: {
                    return 8;
                }
            }
        }
        switch (n) {
            case 0: {
                return -1;
            }
            case 1: {
                return -2;
            }
            case 2: {
                return -3;
            }
            case 3: {
                return -4;
            }
            case 4: {
                return 57;
            }
            case 5: {
                return 55;
            }
            case 6: {
                return 48;
            }
            case 7: {
                return -5;
            }
            case 8: {
                return -7;
            }
            case 9: {
                return -6;
            }
            case 10: {
                return 49;
            }
            case 11: {
                return 51;
            }
            case 12: {
                return 42;
            }
            case 13: {
                return 35;
            }
            case 14: {
                return 50;
            }
            case 15: {
                return 52;
            }
            case 16: {
                return 54;
            }
            case 17: {
                return 56;
            }
            case 18: {
                return 53;
            }
            case 19: {
                return 8;
            }
        }
        return 0;
    }

    public static final int getGameAction(int n) {
        if (kddi) {
            switch (n) {
                case 1: {
                    return 1;
                }
                case 6: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 5: {
                    return 5;
                }
                case 8: {
                    return 8;
                }
                case 20: {
                    return 9;
                }
                case 21: {
                    return 10;
                }
            }
        }
        if (lg) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case -5: {
                    return 8;
                }
            }
        }
        if (motorola) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -6: {
                    return 6;
                }
                case -2: {
                    return 2;
                }
                case -5: {
                    return 5;
                }
                case -20: {
                    return 8;
                }
            }
        }
        if (motoTriplets) {
            switch (n) {
                case 1: {
                    return 1;
                }
                case 6: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 5: {
                    return 5;
                }
                case 20: {
                    return 8;
                }
            }
        }
        if (motoV8) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case -5: {
                    return 8;
                }
            }
        }
        if (motoA1000) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case 13: {
                    return 8;
                }
            }
        }
        if (nokiaKeyboard) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case 110: {
                    return 12;
                }
                case 118: {
                    return 11;
                }
                case -5: {
                    return 8;
                }
                case 114: {
                    return 9;
                }
                case 121: {
                    return 10;
                }
                case 103: {
                    return 8;
                }
                case 116: {
                    return 1;
                }
                case 98: {
                    return 6;
                }
                case 102: {
                    return 2;
                }
                case 104: {
                    return 5;
                }
                case 109: {
                    return 48;
                }
                case 117: {
                    return 42;
                }
                case 106: {
                    return 35;
                }
            }
        }
        if (sagem) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case -5: {
                    return 8;
                }
            }
        }
        if (siemens) {
            switch (n) {
                case -59: {
                    return 1;
                }
                case -60: {
                    return 6;
                }
                case -61: {
                    return 2;
                }
                case -62: {
                    return 5;
                }
                case -26: {
                    return 8;
                }
            }
        }
        if (sharp) {
            switch (n) {
                case 1: {
                    return 1;
                }
                case 6: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 5: {
                    return 5;
                }
                case 20: {
                    return 8;
                }
            }
        }
        if (skt) {
            switch (n) {
                case 141: {
                    return 1;
                }
                case 146: {
                    return 6;
                }
                case 142: {
                    return 2;
                }
                case 145: {
                    return 5;
                }
                case 148: {
                    return 8;
                }
            }
        }
        switch (n) {
            case -1: {
                return 1;
            }
            case -2: {
                return 6;
            }
            case -3: {
                return 2;
            }
            case -4: {
                return 5;
            }
            case 50: {
                return 1;
            }
            case 56: {
                return 6;
            }
            case 52: {
                return 2;
            }
            case 54: {
                return 5;
            }
            case 57: {
                return 12;
            }
            case 55: {
                return 11;
            }
            case 53: {
                return 8;
            }
            case 49: {
                return 9;
            }
            case 51: {
                return 10;
            }
            case 48: {
                return 48;
            }
            case 42: {
                return 42;
            }
            case 35: {
                return 35;
            }
            case -5: {
                return 8;
            }
        }
        return 0;
    }

    public static final int getCanvasAction(int n) {
        if (kddi) {
            switch (n) {
                case 1: {
                    return 1;
                }
                case 6: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 5: {
                    return 5;
                }
                case 8: {
                    return 8;
                }
                case 20: {
                    return 126;
                }
                case 21: {
                    return 127;
                }
            }
        }
        if (lg) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case -5: {
                    return 8;
                }
                case -202: {
                    return 126;
                }
                case -203: {
                    return 127;
                }
            }
        }
        if (motorola) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -6: {
                    return 6;
                }
                case -2: {
                    return 2;
                }
                case -5: {
                    return 5;
                }
                case -20: {
                    return 8;
                }
                case -21: {
                    return 126;
                }
                case -22: {
                    return 127;
                }
            }
        }
        if (motoTriplets) {
            switch (n) {
                case 1: {
                    return 1;
                }
                case 6: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 5: {
                    return 5;
                }
                case 20: {
                    return 8;
                }
                case 21: {
                    return 126;
                }
                case 22: {
                    return 127;
                }
            }
        }
        if (motoV8) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case -5: {
                    return 8;
                }
                case -21: {
                    return 126;
                }
                case -22: {
                    return 127;
                }
            }
        }
        if (motoA1000) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case 13: {
                    return 8;
                }
                case -10: {
                    return 126;
                }
                case -11: {
                    return 127;
                }
            }
        }
        if (nokiaKeyboard) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case 110: {
                    return 57;
                }
                case 118: {
                    return 55;
                }
                case -5: {
                    return 8;
                }
                case 114: {
                    return 49;
                }
                case 121: {
                    return 51;
                }
                case 103: {
                    return 53;
                }
                case 116: {
                    return 50;
                }
                case 98: {
                    return 56;
                }
                case 102: {
                    return 52;
                }
                case 104: {
                    return 54;
                }
                case 109: {
                    return 48;
                }
                case 117: {
                    return 42;
                }
                case 106: {
                    return 35;
                }
                case -6: {
                    return 126;
                }
                case -7: {
                    return 127;
                }
            }
        }
        if (sagem) {
            switch (n) {
                case -1: {
                    return 1;
                }
                case -2: {
                    return 6;
                }
                case -3: {
                    return 2;
                }
                case -4: {
                    return 5;
                }
                case -5: {
                    return 8;
                }
                case -7: {
                    return 126;
                }
                case -6: {
                    return 127;
                }
            }
        }
        if (siemens) {
            switch (n) {
                case -59: {
                    return 1;
                }
                case -60: {
                    return 6;
                }
                case -61: {
                    return 2;
                }
                case -62: {
                    return 5;
                }
                case -26: {
                    return 8;
                }
                case -1: {
                    return 126;
                }
                case -4: {
                    return 127;
                }
            }
        }
        if (sharp) {
            switch (n) {
                case 1: {
                    return 1;
                }
                case 6: {
                    return 6;
                }
                case 2: {
                    return 2;
                }
                case 5: {
                    return 5;
                }
                case 20: {
                    return 8;
                }
                case 21: {
                    return 126;
                }
                case 22: {
                    return 127;
                }
            }
        }
        if (skt) {
            switch (n) {
                case 141: {
                    return 1;
                }
                case 146: {
                    return 6;
                }
                case 142: {
                    return 2;
                }
                case 145: {
                    return 5;
                }
                case 148: {
                    return 8;
                }
                case 129: {
                    return 126;
                }
                case 131: {
                    return 127;
                }
            }
        }
        switch (n) {
            case -1: {
                return 1;
            }
            case -2: {
                return 6;
            }
            case -3: {
                return 2;
            }
            case -4: {
                return 5;
            }
            case 50: {
                return 50;
            }
            case 56: {
                return 56;
            }
            case 52: {
                return 52;
            }
            case 54: {
                return 54;
            }
            case 57: {
                return 57;
            }
            case 55: {
                return 55;
            }
            case 53: {
                return 53;
            }
            case 49: {
                return 49;
            }
            case 51: {
                return 51;
            }
            case 48: {
                return 48;
            }
            case 42: {
                return 42;
            }
            case 35: {
                return 35;
            }
            case -5: {
                return 8;
            }
            case -6: {
                return 126;
            }
            case -7: {
                return 127;
            }
        }
        return 0;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public static final void log(final byte by, final String string) {
        if (by == 0 || by < minLogLevel || MobilePlatform.appTerminated) {
            return;
        }
        Queue<Runnable> queue = pendingLogs;
        synchronized (queue) {
            pendingLogs.add(new Runnable(){

                @Override
                public void run() {
                    String string2 = "";
                    switch (by) {
                        case 1: {
                            string2 = new String("[DEBUG] " + string);
                            break;
                        }
                        case 2: {
                            string2 = new String("[INFO] " + string);
                            break;
                        }
                        case 3: {
                            string2 = new String("[WARNING] " + string);
                            break;
                        }
                        case 4: {
                            string2 = new String("[ERROR] " + string);
                            break;
                        }
                        case 5: {
                            string2 = new String("[FATAL] " + string);
                        }
                    }
                    if (!MobilePlatform.isLibretro) {
                        System.out.println(string2);
                    }
                    try {
                        if (logWriter != null) {
                            logWriter.write(string2);
                            logWriter.newLine();
                            logWriter.flush();
                        }
                    }
                    catch (IOException iOException) {
                        System.out.println("Couldn't write to log file: " + iOException.getMessage());
                        iOException.printStackTrace();
                    }
                }
            });
            pendingLogs.notify();
        }
    }

    public static final void clearOldLog() {
        String string = System.getProperty("freej2me.systemPath");
        logFile = string != null && string.length() > 0 ? new File(string + File.separatorChar + "FreeJ2ME.log") : new File(LOG_FILE);
        if (logFile.exists()) {
            logFile.delete();
        }
        logFile.getParentFile().mkdirs();
        try {
            logWriter = new BufferedWriter(new FileWriter(logFile, true));
        }
        catch (IOException iOException) {
            try {
                logFile = new File(LOG_FILE);
                logFile.getParentFile().mkdirs();
                logWriter = new BufferedWriter(new FileWriter(logFile, true));
            }
            catch (IOException iOException2) {
                System.out.println("Failed to prepare file writer: " + iOException2.getMessage());
                iOException2.printStackTrace();
            }
        }
        new Thread(new Runnable(){

            @Override
            public void run() {
                Mobile.processLogs();
            }
        }, "Logging-Thread").start();
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    private static final void processLogs() {
        Runnable runnable = null;
        while (true) {
            Queue<Runnable> queue = pendingLogs;
            synchronized (queue) {
                while (pendingLogs.isEmpty()) {
                    try {
                        pendingLogs.wait();
                    }
                    catch (Exception exception) {}
                }
                runnable = pendingLogs.poll();
                if (runnable != null) {
                    runnable.run();
                }
            }
        }
    }

    private static int parseIntSetting(String value, int fallback, int min, int max) {
        int parsed;
        try {
            parsed = Integer.parseInt(value);
        }
        catch (Exception exception) {
            parsed = fallback;
        }
        if (parsed < min) {
            parsed = min;
        }
        if (parsed > max) {
            parsed = max;
        }
        return parsed;
    }

    private static float parseFloatSetting(String value, float fallback, float min, float max) {
        float parsed;
        try {
            parsed = Float.parseFloat(value);
        }
        catch (Exception exception) {
            parsed = fallback;
        }
        if (parsed < min) {
            parsed = min;
        }
        if (parsed > max) {
            parsed = max;
        }
        return parsed;
    }

    public static boolean updateSettings() {
        String string;
        String string2;
        minLogLevel = (byte)Integer.parseInt(Mobile.config.sysSettings.get("logLevel"));
        String string3 = Mobile.config.sysSettings.get("fpsCounterPosition");
        platform.setShowFPS(string3);
        M3GRenderUntexturedPolygons = Mobile.config.sysSettings.get("M3GUntextured").equals("on");
        M3GRenderWireframe = Mobile.config.sysSettings.get("M3GWireframe").equals("on");
        MCV3ShowHeapUsage = Mobile.config.sysSettings.get("MCV3ShowHeapUsage").equals("on");
        MCV3ShowTimeMetrics = Mobile.config.sysSettings.get("MCV3ShowTimeMetrics").equals("on");
        deleteTemporaryKJXFiles = Mobile.config.sysSettings.get("deleteTempKJXFiles").equals("on");
        dumpAudioStreams = Mobile.config.sysSettings.get("dumpAudioStreams").equals("on");
        dumpGraphicsObjects = Mobile.config.sysSettings.get("dumpGraphicsObjects").equals("on");
        String string4 = Mobile.config.sysSettings.get("sound");
        sound = false;
        if (string4.equals("on")) {
            sound = true;
        }
        audioSafe = !Mobile.config.sysSettings.get("audioSafe").equals("off");
        audioGainDb = Mobile.parseFloatSetting(Mobile.config.sysSettings.get("audioGainDb"), -9.0f, -48.0f, 0.0f);
        audioSampleRate = Mobile.parseIntSetting(Mobile.config.sysSettings.get("audioSampleRate"), 44100, 8000, 96000);
        audioMaxSfx = Mobile.parseIntSetting(Mobile.config.sysSettings.get("audioMaxSfx"), 4, 1, 32);
        audioToneVolumeScale = Mobile.parseFloatSetting(Mobile.config.sysSettings.get("audioToneVolumeScale"), 70.0f, 0.0f, 100.0f) / 100.0f;
        audioSmafPcmGainMaxDb = Mobile.parseFloatSetting(Mobile.config.sysSettings.get("audioSmafPcmGainMaxDb"), -6.0f, -48.0f, 0.0f);
        if ((string2 = Mobile.config.sysSettings.get("soundfont")).equals("Custom") && !useCustomMidi) {
            useCustomMidi = true;
            Manager.changeCustomMidi();
        } else if (string2.equals("Default") && useCustomMidi) {
            useCustomMidi = false;
            Manager.changeCustomMidi();
        }
        String string5 = Mobile.config.sysSettings.get("textfont");
        if (string5.equals("Custom")) {
            useCustomTextFont = true;
        } else if (string5.equals("Default")) {
            useCustomTextFont = false;
        }
        lcdWidth = Integer.parseInt(Mobile.config.settings.get("scrwidth"));
        lcdHeight = Integer.parseInt(Mobile.config.settings.get("scrheight"));
        limitFPS = Integer.parseInt(Mobile.config.settings.get("fps"));
        String string6 = Mobile.config.settings.get("phone");
        kddi = false;
        lg = false;
        motorola = false;
        motoTriplets = false;
        motoV8 = false;
        motoA1000 = false;
        nokiaKeyboard = false;
        sagem = false;
        siemens = false;
        sharp = false;
        skt = false;
        if (string6.equals("KDDI")) {
            kddi = true;
        }
        if (string6.equals("LG")) {
            lg = true;
        }
        if (string6.equals("Motorola")) {
            motorola = true;
        }
        if (string6.equals("MotoTriplets")) {
            motoTriplets = true;
        }
        if (string6.equals("MotoV8")) {
            motoV8 = true;
        }
        if (string6.equals("MotoA1000")) {
            motoA1000 = true;
        }
        if (string6.equals("NokiaKeyboard")) {
            nokiaKeyboard = true;
        }
        if (string6.equals("Sagem")) {
            sagem = true;
        }
        if (string6.equals("Siemens")) {
            siemens = true;
        }
        if (string6.equals("Sharp")) {
            sharp = true;
        }
        if (string6.equals("SKT")) {
            skt = true;
        }
        if ((string = Mobile.config.settings.get("backlightcolor")).equals("Disabled")) {
            maskIndex = 0;
        } else if (string.equals("Green")) {
            maskIndex = 1;
        } else if (string.equals("Cyan")) {
            maskIndex = 2;
        } else if (string.equals("Orange")) {
            maskIndex = 3;
        } else if (string.equals("Violet")) {
            maskIndex = 4;
        } else if (string.equals("Red")) {
            maskIndex = 5;
        }
        String string7 = Mobile.config.settings.get("dojaversion");
        DoJaVersion = Integer.parseInt(string7);
        String string8 = Mobile.config.settings.get("spdhacknoalpha");
        if (string8.equals("on")) {
            noAlphaOnBlankImages = true;
        } else if (string8.equals("off")) {
            noAlphaOnBlankImages = false;
        }
        String string9 = Mobile.config.settings.get("spdhackm3ghalfres");
        if (string9.equals("on")) {
            halfResM3GRaster = true;
        } else if (string9.equals("off")) {
            halfResM3GRaster = false;
        }
        String string10 = Mobile.config.settings.get("spdhackmcv3halfres");
        if (string10.equals("on")) {
            halfResMCV3Raster = true;
        } else if (string10.equals("off")) {
            halfResMCV3Raster = false;
        }
        String string11 = Mobile.config.settings.get("spdhackmcv3nolighting");
        if (string11.equals("on")) {
            MCV3NoLighting = true;
        } else if (string11.equals("off")) {
            MCV3NoLighting = false;
        }
        String string12 = Mobile.config.settings.get("compatfantasyzonefix");
        if (string12.equals("on")) {
            compatFantasyZoneFix = true;
        } else if (string12.equals("off")) {
            compatFantasyZoneFix = false;
        }
        String string13 = Mobile.config.settings.get("compattranstooriginonreset");
        if (string13.equals("on")) {
            compatTranslateToOriginOnReset = true;
        } else if (string13.equals("off")) {
            compatTranslateToOriginOnReset = false;
        }
        String string14 = Mobile.config.settings.get("compatimmediaterepaints");
        if (string14.equals("on")) {
            compatImmediateRepaints = true;
        } else if (string14.equals("off")) {
            compatImmediateRepaints = false;
        }
        String string15 = Mobile.config.settings.get("compatoverrideplatchecks");
        if (string15.equals("on")) {
            compatOverridePlatformChecks = true;
        } else if (string15.equals("off")) {
            compatOverridePlatformChecks = false;
        }
        String string16 = Mobile.config.settings.get("compatsiemensfriendlydrawing");
        if (string16.equals("on")) {
            compatSiemensFriendlyDrawing = true;
        } else if (string16.equals("off")) {
            compatSiemensFriendlyDrawing = false;
        }
        String string17 = Mobile.config.settings.get("compatignorevolumechanges");
        if (string17.equals("on")) {
            compatIgnoreVolumeChanges = true;
        } else if (string17.equals("off")) {
            compatIgnoreVolumeChanges = false;
        }
        String string18 = Mobile.config.settings.get("compatmcv3horizfovfix");
        if (string18.equals("on")) {
            compatMCV3HorizontalFovFix = true;
        } else if (string18.equals("off")) {
            compatMCV3HorizontalFovFix = false;
        }
        String string19 = Mobile.config.settings.get("fontoffset");
        fontSizeOffset = (byte)Integer.parseInt(string19);
        PlatformFont.updateDefaultFont();
        String string20 = Mobile.config.settings.get("fpshack");
        if (string20.equals("Disabled")) {
            unlockFramerateHack = 0;
        } else if (string20.equals("Safe")) {
            unlockFramerateHack = 1;
        } else if (string20.equals("Extended")) {
            unlockFramerateHack = (byte)2;
        } else if (string20.equals("Aggressive")) {
            unlockFramerateHack = (byte)3;
        }
        String string21 = Mobile.config.settings.get("rotate");
        if (string21.equals("on")) {
            string21 = "270";
        }
        if (string21.equals("off")) {
            string21 = "0";
        }
        if (Integer.parseInt(string21) != rotateDisplay) {
            rotateDisplay = Integer.parseInt(string21);
            return true;
        }
        return false;
    }

    public static void restartApp() {
        try {
            String[] stringArray;
            String string = System.getProperty("java.home") + "/bin/java";
            String string2 = System.getProperty("java.class.path");
            String string3 = Mobile.getMainClassFromJar("file:" + string2);
            String string4 = null;
            if (MobilePlatform.fileName != null) {
                File jarFileTmp = new File(MobilePlatform.fileName.replace("file:", "").trim());
                string4 = jarFileTmp.getCanonicalPath();
            }
            if (!MobilePlatform.isLibretro) {
                stringArray = new String[]{string, "-jar", "-Dfile.encoding=" + textEncoding, string2, string4};
                ProcessBuilder processBuilder = null;
                processBuilder = string4 != null ? new ProcessBuilder(string, "-jar", "-Dfile.encoding=" + textEncoding, string2, string4) : new ProcessBuilder(string, "-jar", "-Dfile.encoding=" + textEncoding, string2);
                processBuilder.start();
                System.exit(0);
            } else {
                libretroRestartRequested = 1;
                if (textEncoding.equals("ISO_8859_1")) {
                    libretroEncodingRequested = 0;
                } else if (textEncoding.equals("Shift_JIS")) {
                    libretroEncodingRequested = 1;
                } else if (textEncoding.equals("EUC_KR")) {
                    libretroEncodingRequested = (byte)2;
                }
            }
        }
        catch (Exception exception) {
            Mobile.log((byte)2, Mobile.class.getPackage().getName() + "." + Mobile.class.getSimpleName() + ": Failed to restart FreeJ2ME: " + exception.getMessage());
            exception.printStackTrace();
        }
    }

    private static String getMainClassFromJar(String string) {
        try {
            URL uRL = new URL(string);
            JarFile jarFile = new JarFile(uRL.getFile());
            Manifest manifest = jarFile.getManifest();
            Attributes attributes = manifest.getMainAttributes();
            return attributes.getValue("Main-Class");
        }
        catch (Exception exception) {
            return null;
        }
    }

    static {
        pendingLogs = new LinkedList<Runnable>();
        supportedEncodings = new String[]{"ISO_8859_1", "Shift_JIS", "EUC_KR"};
        textEncoding = supportedEncodings[0];
        isDoJa = false;
        isKDDI = false;
        isSKT = false;
        DoJaVersion = 200;
        usingMessagingAPI = false;
        noAlphaOnBlankImages = true;
        halfResM3GRaster = false;
        halfResMCV3Raster = false;
        MCV3NoLighting = false;
        lcdWidth = 240;
        lcdHeight = 320;
        rotateDisplay = 0;
        useCustomMidi = false;
        useCustomTextFont = false;
        fontSizeOffset = 0;
        dumpAudioStreams = false;
        dumpGraphicsObjects = false;
        LOG_FILE = "freej2me_system" + File.separatorChar + "FreeJ2ME.log";
        SIEMENS_DATA_PATH = "freej2me_system" + File.separatorChar + "SiemensData" + File.separatorChar;
        XCE_DATA_PATH = "freej2me_system" + File.separatorChar + "XceData" + File.separatorChar;
        minLogLevel = (byte)2;
        tempKJXDir = "." + File.separatorChar + "FreeJ2MEDumps" + File.separatorChar + "KDDI" + File.separatorChar;
        deleteTemporaryKJXFiles = true;
        lcduiBGColor = 0xFFFFFF;
        lcduiStrokeColor = 0x777777;
        lcduiTextColor = 0;
        lcdMaskColors = new int[]{-1, -8917158, -11110666, -1140432, -3900673, -40350, -1};
        maskIndex = 1;
        renderLCDMask = false;
        funLightsEnabled = false;
        funLightRegionColor = new int[]{-1996488706, -1996488706, -1996488706, -1996488706, -1996488706};
        funLightRegionSize = (byte)8;
        compatFantasyZoneFix = false;
        compatTranslateToOriginOnReset = false;
        compatImmediateRepaints = false;
        compatOverridePlatformChecks = true;
        compatSiemensFriendlyDrawing = false;
        compatIgnoreVolumeChanges = false;
        compatMCV3HorizontalFovFix = false;
        M3GRenderUntexturedPolygons = false;
        M3GRenderWireframe = false;
        MCV3ShowTimeMetrics = false;
        MCV3ShowHeapUsage = false;
        kddi = false;
        lg = false;
        motorola = false;
        motoV8 = false;
        motoTriplets = false;
        motoA1000 = false;
        nokiaKeyboard = false;
        sagem = false;
        siemens = false;
        sharp = false;
        skt = false;
        awtguiKeycodes = new int[]{9, 8, 0, 2, 7, 3, 1, 10, 14, 11, 15, 18, 16, 5, 17, 4, 12, 6, 13, 19, 20, 21, 22};
        sdlguiKeycodes = new int[]{7, 5, 4, 13, 9, 6, 8, 18, 19, 10, 11, 0, 1, 2, 3, 14, 15, 16, 17, 20};
        keyArray = new String[]{"Up", "Down", "Left", "Right", "9", "7", "0", "Fire", "RightSoft", "LeftSoft", "1", "3", "*", "#", "2", "4", "6", "8", "5", "CLR", "Fast Forward", "Screenshot", "MIDlet Pause/Resume"};
        sound = true;
        audioSafe = true;
        audioGainDb = -9.0f;
        audioSampleRate = 44100;
        audioMaxSfx = 4;
        audioToneVolumeScale = 0.70f;
        audioSmafPcmGainMaxDb = -6.0f;
        activeSfxCount = 0;
        limitFPS = 0;
        unlockFramerateHack = 0;
        isFastForwarding = false;
        isPaused = false;
        fastForwardMultiplier = 20.0f;
        libretroRestartRequested = 0;
        libretroEncodingRequested = 0;
        isAAEnabled = false;
        vibrationDuration = 0;
        vibrationStrength = 65535;
    }
}

