/*
 * Decompiled with CFR 0.152.
 */
package org.recompile.mobile;

import com.jblend.graphics.j3d.FigureLayout;
import com.mascotcapsule.micro3d.v3.AffineTrans;
import com.mascotcapsule.micro3d.v3.Light;
import com.motorola.graphics.j3d.Effect3D;
import com.motorola.graphics.j3d.Graphics3D;
import com.nokia.mid.ui.DirectGraphics;
import com.nttdocomo.opt.ui.j3d.Figure;
import com.nttdocomo.opt.ui.j3d.PrimitiveArray;
import com.nttdocomo.opt.ui.j3d.Texture;
import com.nttdocomo.opt.ui.j3d.Vector3D;
import com.nttdocomo.ui.Canvas;
import com.nttdocomo.ui.Display;
import com.nttdocomo.ui.Graphics;
import com.nttdocomo.ui.ImageMap;
import com.nttdocomo.ui.Sprite;
import com.nttdocomo.ui.SpriteSet;
import com.nttdocomo.ui.UIException;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferInt;
import java.util.ArrayList;
import javax.microedition.lcdui.Font;
import javax.microedition.lcdui.Image;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;
import org.recompile.mobile.PlatformImage;

public abstract class PlatformGraphics
implements DirectGraphics,
com.jblend.graphics.j3d.Graphics3D,
Graphics3D,
com.nttdocomo.opt.ui.j3d.Graphics3D,
com.vodafone.v10.graphics.j3d.Graphics3D {
    protected static final byte[] gaussianKernel = new byte[]{1, 2, 3, 2, 1, 0, 0, 2, 5, 8, 5, 2, 0, 0, 3, 8, 12, 8, 3, 0, 0, 2, 5, 8, 5, 2, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
    public static final int BASELINE = 64;
    public static final int BOTTOM = 32;
    public static final int DOTTED = 1;
    public static final int HCENTER = 1;
    public static final int LEFT = 4;
    public static final int RIGHT = 8;
    public static final int SOLID = 0;
    public static final int TOP = 16;
    public static final int VCENTER = 2;
    private static final short HV = 24576;
    private static final short HV90 = 24666;
    private static final short HV180 = 24756;
    private static final short HV270 = 24846;
    private static final short H90 = 8282;
    private static final short H180 = 8372;
    private static final short H270 = 8462;
    private static final short V90 = 16474;
    private static final short V180 = 16564;
    private static final short V270 = 16654;
    public static final int BLACK = 0;
    public static final int BLUE = 1;
    public static final int LIME = 2;
    public static final int AQUA = 3;
    public static final int RED = 4;
    public static final int FUCHSIA = 5;
    public static final int YELLOW = 6;
    public static final int WHITE = 7;
    public static final int GRAY = 8;
    public static final int NAVY = 9;
    public static final int GREEN = 10;
    public static final int TEAL = 11;
    public static final int MAROON = 12;
    public static final int PURPLE = 13;
    public static final int OLIVE = 14;
    public static final int SILVER = 15;
    public static final int FLIP_NONE = 0;
    public static final int FLIP_HORIZONTAL = 1;
    public static final int FLIP_VERTICAL = 2;
    public static final int FLIP_ROTATE = 3;
    public static final int FLIP_ROTATE_LEFT = 4;
    public static final int FLIP_ROTATE_RIGHT = 5;
    public static final int FLIP_ROTATE_RIGHT_HORIZONTAL = 6;
    public static final int FLIP_ROTATE_RIGHT_VERTICAL = 7;
    protected int renderMode = 0;
    protected int srcRatio = 255;
    protected int dstRatio = 255;
    private static int frameCount = 0;
    private static long lastFpsTime = System.nanoTime();
    private static int fps = 0;
    private static final int GAUSSIAN_SCALE_FACTOR = 159;
    protected BufferedImage canvas;
    protected Graphics2D gc;
    protected ArrayList<Integer> mcv3commands = new ArrayList();
    protected int canvasWidth;
    protected int canvasHeight;
    protected int[] canvasData;
    protected PlatformImage baseImage;
    protected boolean fastBlit;
    protected int translateX = 0;
    protected int translateY = 0;
    protected int resetTransX = 0;
    protected int resetTransY = 0;
    private boolean firstReset = true;
    protected int color = -16777216;
    protected Font font = Font.getDefaultFont();
    protected com.nttdocomo.ui.Font dojaFont = com.nttdocomo.ui.Font.getDefaultFont();
    protected int strokeStyle = 0;
    protected int dojaLockCount = 0;
    protected int dojaflipMode = 0;
    protected boolean usePictoColor = false;
    protected boolean contextDisposed = false;
    private static final String fastForwardIndicator = "\u2b9e\u2b9e";
    private static final String pauseIndicator = "PAUSED!";
    private static final Font HUDFont = new Font(0, 0, 8);
    protected com.mascotcapsule.micro3d.v3.Graphics3D mcv3gc = null;
    protected AffineTrans[] viewTrans = null;
    protected com.mascotcapsule.micro3d.v3.Texture[] mcv3textures = null;
    protected com.mascotcapsule.micro3d.v3.Texture mcv3envMap = null;
    protected com.mascotcapsule.micro3d.v3.FigureLayout mcv3layout = new com.mascotcapsule.micro3d.v3.FigureLayout();
    protected com.mascotcapsule.micro3d.v3.Effect3D mcv3effect = new com.mascotcapsule.micro3d.v3.Effect3D();
    protected Light mcv3light = new Light();

    public PlatformGraphics(PlatformImage platformImage) {
        this.baseImage = platformImage;
        this.canvas = platformImage.getCanvas();
        this.gc = this.canvas.createGraphics();
        this.canvasWidth = this.canvas.getWidth();
        this.canvasHeight = this.canvas.getHeight();
        this.canvasData = ((DataBufferInt)this.canvas.getRaster().getDataBuffer()).getData();
        this.mcv3commands.add(-33554431);
        this.setClip(0, 0, this.canvasWidth, this.canvasHeight);
        this.gc.setFont(this.font.awtFont);
        this.setColor(this.color);
        this.gc.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
    }

    public void reset() {
        this.reset(0, 0, this.canvasWidth, this.canvasHeight);
    }

    public void reset(int n, int n2, int n3, int n4) {
        Mobile.dlog("Graphics", "reset: clip=[", n, ",", n2, ",", n3, "x", n4, "] translateX=", this.translateX, " translateY=", this.translateY);
        if (this.firstReset) {
            this.resetTransX = this.getTranslateX();
            this.resetTransY = this.getTranslateY();
            this.firstReset = false;
        }
        if (!Mobile.compatTranslateToOriginOnReset) {
            this.setOrigin(this.resetTransX, this.resetTransY);
        } else {
            this.setOrigin(0, 0);
        }
        this.setClip(n, n2, n3, n4);
        this.setColor(0, 0, 0);
        this.setFont(Font.getDefaultFont());
        this.setStrokeStyle(0);
    }

    public Graphics2D getGraphics2D() {
        return this.gc;
    }

    public BufferedImage getCanvas() {
        return this.canvas;
    }

    public int[] getFrameBuffer() {
        return this.canvasData;
    }

    public void clearRect(int n, int n2, int n3, int n4) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        int n5 = this.color;
        this.setColor(-16777216);
        this.fillRect(n, n2, n3, n4);
        this.setColor(n5);
    }

    public void copyArea(int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        int n8;
        int n9;
        n5 = this.AnchorX(n5, n3, n7);
        n6 = this.AnchorY(n6, n4, n7);
        if ((n += this.getTranslateX()) < 0 || (n2 += this.getTranslateY()) < 0 || n + n3 > this.canvasWidth || n2 + n4 > this.canvasHeight) {
            throw new IllegalArgumentException("Source area exceeds the bounds of the graphics object.");
        }
        int[] nArray = new int[n3 * n4];
        for (n9 = 0; n9 < n4; ++n9) {
            for (n8 = 0; n8 < n3; ++n8) {
                nArray[n9 * n3 + n8] = this.canvasData[(n2 + n9) * this.canvas.getWidth() + (n + n8)];
            }
        }
        for (n9 = 0; n9 < n4; ++n9) {
            for (n8 = 0; n8 < n3; ++n8) {
                if (n5 + n8 < 0 || n6 + n9 < 0 || n5 + n8 >= this.canvas.getWidth() || n6 + n9 >= this.canvas.getHeight()) continue;
                this.canvasData[(n6 + n9) * this.canvas.getWidth() + (n5 + n8)] = nArray[n9 * n3 + n8];
            }
        }
    }

    public void copyToFrameBuffer(BufferedImage bufferedImage, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        int n8;
        int n9;
        if (bufferedImage == null) {
            return;
        }
        n5 = this.AnchorX(n5, n3, n7);
        n6 = this.AnchorY(n6, n4, n7);
        if ((n += this.getTranslateX()) < 0 || (n2 += this.getTranslateY()) < 0 || n + n3 > this.canvasWidth || n2 + n4 > this.canvasHeight) {
            throw new IllegalArgumentException("Source area exceeds the bounds of the graphics object.");
        }
        int[] nArray = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
        int[] nArray2 = new int[n3 * n4];
        for (n9 = 0; n9 < n4; ++n9) {
            for (n8 = 0; n8 < n3; ++n8) {
                nArray2[n9 * n3 + n8] = this.canvasData[(n2 + n9) * this.canvas.getWidth() + (n + n8)];
            }
        }
        for (n9 = 0; n9 < n4; ++n9) {
            for (n8 = 0; n8 < n3; ++n8) {
                if (n5 + n8 < 0 || n6 + n9 < 0 || n5 + n8 >= bufferedImage.getWidth() || n6 + n9 >= bufferedImage.getHeight()) continue;
                nArray[(n6 + n9) * bufferedImage.getWidth() + (n5 + n8)] = nArray2[n9 * n3 + n8];
            }
        }
    }

    public void copyToFrameBuffer(Image image, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        this.copyToFrameBuffer(image.getCanvas(), n, n2, n3, n4, n5, n6, n7);
    }

    public void copyToFrameBuffer(com.nttdocomo.ui.Image image, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        this.copyToFrameBuffer(image.getCanvas(), n, n2, n3, n4, n5, n6, n7);
    }

    public void drawChar(char c, int n, int n2, int n3) {
        this.drawString(Character.toString(c), n, n2, n3);
    }

    public void drawChars(char[] cArray, int n, int n2, int n3, int n4, int n5) {
        char[] cArray2 = new char[n2];
        for (int i = n; i < n + n2; ++i) {
            if (i < 0 || i >= cArray.length) continue;
            cArray2[i - n] = cArray[i];
        }
        this.drawString(new String(cArray2), n3, n4, n5);
    }

    public void drawImage(Image image, int n, int n2, int n3) {
        try {
            n = this.AnchorX(n, image.getWidth(), n3);
            n2 = this.AnchorY(n2, image.getHeight(), n3);
            Mobile.dlog("Graphics", "drawImage: image size=", image.getWidth(), "x", image.getHeight(), " at (", n, ",", n2, ") anchor=", n3);
            this.drawRGB(image.getDataBuffer(), 0, image.getWidth(), n, n2, image.getWidth(), image.getHeight(), true);
        }
        catch (Exception exception) {
            Mobile.log((byte)4, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawImage :" + exception.getMessage());
            Mobile.dlog("Graphics", "drawImage FAILED: ", exception.getMessage());
        }
    }

    public void drawImage(Image image, int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.drawImage(image, n, n2, 0);
    }

    public void flushGraphics(PlatformImage platformImage, int n, int n2, int n3, int n4) {
        try {
            this.fastBlit = Mobile.maskIndex == 0 && !Mobile.funLightsEnabled;
            boolean bl = this.fastBlit;
            if (this.fastBlit && platformImage.getDataBuffer() == this.canvasData) {
                if (!MobilePlatform.showFPS.equals("Off")) {
                    this.showFPS();
                }
                return;
            }
            if (this.fastBlit && n == 0 && n2 == 0 && n3 == this.canvasWidth && n4 == this.canvasHeight) {
                System.arraycopy(platformImage.getDataBuffer(), 0, this.canvasData, 0, this.canvasWidth * this.canvasHeight);
                if (!MobilePlatform.showFPS.equals("Off")) {
                    this.showFPS();
                }
                return;
            }
            if (n < 0) {
                n = 0;
            }
            if (n2 < 0) {
                n2 = 0;
            }
            if (n3 + n > this.canvasWidth) {
                n3 = this.canvasWidth - n;
            }
            if (n4 + n2 > this.canvasHeight) {
                n4 = this.canvasHeight - n2;
            }
            int[] nArray = null;
            if (Mobile.funLightsEnabled) {
                nArray = new int[n3 * n4];
                this.drawFunLights(nArray, n3, n4);
            }
            for (int i = n2; i < n2 + n4; ++i) {
                int n5;
                int n6;
                if (this.fastBlit) {
                    n6 = i * this.canvasWidth + n;
                    n5 = i * platformImage.getWidth() + n;
                    System.arraycopy(platformImage.getDataBuffer(), n5, this.canvasData, n6, n3);
                    continue;
                }
                n6 = i * this.canvasWidth;
                n5 = i * platformImage.getWidth();
                for (int j = n; j < n + n3; ++j) {
                    this.canvasData[n6 + j] = platformImage.getDataBuffer()[n5 + j] & Mobile.lcdMaskColors[Mobile.maskIndex];
                    if (!Mobile.funLightsEnabled) continue;
                    this.canvasData[n6 + j] = this.blendPixels(nArray[n5 + j], this.canvasData[n6 + j]);
                }
            }
            if (!MobilePlatform.showFPS.equals("Off")) {
                this.showFPS();
            }
        }
        catch (Exception exception) {
            Mobile.log((byte)1, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": flushGraphics A:" + exception.getMessage());
        }
    }

    public void drawRegion(Image image, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        if (n3 == 0 || n4 == 0) {
            return;
        }
        if (image == null) {
            throw new NullPointerException("Source image cannot be null");
        }
        if (n < 0 || n2 < 0 || n + n3 > image.getCanvas().getWidth() || n2 + n4 > image.getCanvas().getHeight()) {
            throw new IllegalArgumentException("Source region is out of bounds");
        }
        if (Mobile.compatSiemensFriendlyDrawing) {
            if (this.getTranslateX() < 0) {
                n6 -= this.getTranslateX();
            }
            if (this.getTranslateY() < 0) {
                n7 -= this.getTranslateY();
            }
        }
        try {
            if (n5 == 0) {
                n6 = this.AnchorX(n6, n3, n8);
                n7 = this.AnchorY(n7, n4, n8);
                this.drawRGB(image.getDataBuffer(), n + n2 * image.getWidth(), image.getWidth(), n6, n7, n3, n4, true);
            } else {
                PlatformImage platformImage = new PlatformImage(image, n, n2, n3, n4, n5);
                n6 = this.AnchorX(n6, platformImage.getWidth(), n8);
                n7 = this.AnchorY(n7, platformImage.getHeight(), n8);
                this.drawRGB(platformImage.getDataBuffer(), 0, platformImage.getWidth(), n6, n7, platformImage.getWidth(), platformImage.getHeight(), true);
            }
        }
        catch (Exception exception) {
            Mobile.log((byte)4, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawRegion A (x:" + n6 + " y:" + n7 + " w:" + n3 + " h:" + n4 + "):" + exception.getMessage());
        }
    }

    public void drawRegion(Image image, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8, int n9, int n10, int n11) {
        if (n3 == 0 || n4 == 0) {
            return;
        }
        Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawRegion B is untested!");
        try {
            if (n5 == 0) {
                n6 = this.AnchorX(n6, n3, n10);
                n7 = this.AnchorY(n7, n4, n10);
                this.gc.drawImage(image.getCanvas(), n6, n7, n6 + n8, n7 + n9, n, n2, n + n3, n2 + n4, null);
            } else {
                PlatformImage platformImage = new PlatformImage(image, n, n2, n3, n4, n5);
                n6 = this.AnchorX(n6, platformImage.getWidth(), n10);
                n7 = this.AnchorY(n7, platformImage.getHeight(), n10);
                this.gc.drawImage(platformImage.getCanvas(), n6, n7, n6 + n8, n7 + n9, n, n2, n + n3, n2 + n4, null);
            }
        }
        catch (Exception exception) {
            Mobile.log((byte)4, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawRegion B failed:" + exception.getMessage());
        }
    }

    public void drawRGB(int[] nArray, int n, int n2, int n3, int n4, int n5, int n6, boolean bl) {
        if (n5 == 0 || n6 == 0) {
            return;
        }
        if (nArray == null) {
            throw new NullPointerException("RGB Data array is null");
        }
        if (n < 0 || n >= nArray.length) {
            throw new ArrayIndexOutOfBoundsException("Invalid offset for RGB Data");
        }
        if (n2 > 0) {
            if (n + n2 * (n6 - 1) + n5 > nArray.length) {
                throw new ArrayIndexOutOfBoundsException("DrawRGB Area is out of bounds (len" + nArray.length + " max" + (n + n2 * (n6 - 1) + n5) + " scanlength " + n2 + " offset " + n + ")");
            }
        } else if (n + n5 > nArray.length || n + n2 * (n6 - 1) < 0) {
            throw new ArrayIndexOutOfBoundsException("DrawRGB Area is out of bounds (scanlength " + n2 + ")");
        }
        n3 += this.translateX;
        int n7 = this.getClipX() + this.translateX < 0 ? 0 : this.getClipX() + this.translateX;
        int n8 = this.getClipY() + this.translateY < 0 ? 0 : this.getClipY() + this.translateY;
        int n9 = this.getClipWidth() + this.getClipX() + this.translateX > this.canvasWidth ? this.canvasWidth : this.getClipWidth() + this.getClipX() + this.translateX;
        int n10 = this.getClipHeight() + this.getClipY() + this.translateY > this.canvasHeight ? this.canvasHeight : this.getClipHeight() + this.getClipY() + this.translateY;
        int n11 = n10;
        if ((n4 += this.translateY) + n6 > n10) {
            n6 = n10 - n4;
        }
        if (n3 + n5 > n9) {
            n5 = n9 - n3;
        }
        if (n5 == 0 || n6 == 0) {
            return;
        }
        int n12 = n3 > n7 ? 0 : n7 - n3;
        int n13 = n4 > n8 ? 0 : n8 - n4;
        for (int i = n13; i < n6; ++i) {
            int n14 = n + i * n2;
            int n15 = (n4 + i) * this.canvasWidth;
            for (int j = n12; j < n5; ++j) {
                this.canvasData[n15 + n3 + j] = !bl || (nArray[n14 + j] >> 24 & 0xFF) == 255 ? nArray[n14 + j] | 0xFF000000 : this.blendPixels(nArray[n14 + j], this.canvasData[n15 + n3 + j]);
            }
        }
    }

    public void drawLine(int n, int n2, int n3, int n4) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        n += this.translateX;
        n3 += this.translateX;
        n2 += this.translateY;
        n4 += this.translateY;
        int n5 = this.getClipX() + this.translateX < 0 ? 0 : this.getClipX() + this.translateX;
        int n6 = this.getClipY() + this.translateY < 0 ? 0 : this.getClipY() + this.translateY;
        int n7 = this.getClipWidth() + this.getClipX() + this.translateX > this.canvasWidth ? this.canvasWidth : this.getClipWidth() + this.getClipX() + this.translateX;
        int n8 = this.getClipHeight() + this.getClipY() + this.translateY > this.canvasHeight ? this.canvasHeight : this.getClipHeight() + this.getClipY() + this.translateY;
        int n9 = Math.abs(n3 - n);
        int n10 = Math.abs(n4 - n2);
        int n11 = n < n3 ? 1 : -1;
        int n12 = n2 < n4 ? 1 : -1;
        int n13 = n9 - n10;
        int n14 = 0;
        while (true) {
            if (n >= n5 && n < n7 && n2 >= n6 && n2 < n8 && (this.strokeStyle == 1 && n14 % 4 <= 1 || this.strokeStyle == 0)) {
                int n15 = this.canvasData[n2 * this.canvasWidth + n] = !Mobile.isDoJa && this.getAlphaComponent() == 255 ? this.getColor() : this.blendPixels(this.getColor(), this.canvasData[n2 * this.canvasWidth + n]);
            }
            if (n == n3 && n2 == n4) break;
            int n16 = n13 * 2;
            if (n16 > -n10) {
                n13 -= n10;
                n += n11;
            }
            if (n16 < n9) {
                n13 += n9;
                n2 += n12;
            }
            ++n14;
        }
    }

    public void drawArc(int n, int n2, int n3, int n4, int n5, int n6) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        n6 = -n6;
        n5 = -n5;
        ++n3;
        ++n4;
        n += this.translateX;
        n2 += this.translateY;
        int n7 = this.getClipX() + this.translateX < 0 ? 0 : this.getClipX() + this.translateX;
        int n8 = this.getClipY() + this.translateY < 0 ? 0 : this.getClipY() + this.translateY;
        int n9 = this.getClipWidth() + this.getClipX() + this.translateX > this.canvasWidth ? this.canvasWidth : this.getClipWidth() + this.getClipX() + this.translateX;
        int n10 = this.getClipHeight() + this.getClipY() + this.translateY > this.canvasHeight ? this.canvasHeight : this.getClipHeight() + this.getClipY() + this.translateY;
        int n11 = 0;
        float f = (float)n + (float)n3 / 2.0f;
        float f2 = (float)n2 + (float)n4 / 2.0f;
        float f3 = (float)n3 / 2.0f;
        float f4 = (float)n4 / 2.0f;
        float f5 = PlatformGraphics.fastToRadians(n5);
        float f6 = PlatformGraphics.fastToRadians(n5 + n6) - PlatformGraphics.fastToRadians(n5);
        int n12 = (int)Math.abs((float)(n6 * ((n3 + n4) / 2)) / 50.0f);
        int n13 = (int)Math.round((double)f + (double)f3 * Math.cos(f5));
        int n14 = (int)Math.round((double)f2 + (double)f4 * Math.sin(f5));
        int n15 = -1;
        int n16 = -1;
        if (n13 >= n7 && n13 < n9 && n14 >= n8 && n14 < n10 && (this.strokeStyle == 1 && n11 % 4 <= 1 || this.strokeStyle == 0)) {
            this.canvasData[n14 * this.canvasWidth + n13] = !Mobile.isDoJa && this.getAlphaComponent() == 255 ? this.getColor() : this.blendPixels(this.getColor(), this.canvasData[n14 * this.canvasWidth + n13]);
            ++n11;
        }
        for (int i = 1; i < n12; ++i) {
            float f7 = 0.0f;
            int n17 = (int)Math.round((double)f2 + (double)f4 * Math.sin(f7));
            f7 = f5 + (float)i * f6 / (float)n12;
            int n18 = (int)Math.round((double)f + (double)f3 * Math.cos(f7));
            if (n15 == n18 ^ n16 == n17 || n13 == n18 && n14 == n17) {
                n15 = -1;
                n16 = -1;
                continue;
            }
            n15 = n18;
            n16 = n17;
            if (n18 >= n7 && n18 < n9 && n17 >= n8 && n17 < n10 && (this.strokeStyle == 1 && n11 % 4 <= 1 || this.strokeStyle == 0)) {
                this.canvasData[n17 * this.canvasWidth + n18] = !Mobile.isDoJa && this.getAlphaComponent() == 255 ? this.getColor() : this.blendPixels(this.getColor(), this.canvasData[n17 * this.canvasWidth + n18]);
            }
            ++n11;
        }
    }

    public void drawRect(int n, int n2, int n3, int n4) {
        if (n3 < 0 || n4 < 0) {
            return;
        }
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        ++n3;
        ++n4;
        n += this.translateX;
        n2 += this.translateY;
        int n5 = this.getClipX() + this.translateX < 0 ? 0 : this.getClipX() + this.translateX;
        int n6 = this.getClipY() + this.translateY < 0 ? 0 : this.getClipY() + this.translateY;
        int n7 = this.getClipWidth() + this.getClipX() + this.translateX > this.canvasWidth ? this.canvasWidth : this.getClipWidth() + this.getClipX() + this.translateX;
        int n8 = this.getClipHeight() + this.getClipY() + this.translateY > this.canvasHeight ? this.canvasHeight : this.getClipHeight() + this.getClipY() + this.translateY;
        for (int i = 0; i < n4; ++i) {
            int n9 = 0;
            while (n9 < n3) {
                if (n + n9 >= n5 && n2 + i >= n6 && n + n9 < n7 && n2 + i < n8 && (this.strokeStyle == 1 && (i == 0 && n9 % 4 <= 1 || n9 == 0 && i % 4 <= 1 || i == n4 - 1 && n9 % 4 <= 1 || n9 == n3 - 1 && i % 4 <= 1) || this.strokeStyle == 0)) {
                    int n10 = this.canvasData[(n2 + i) * this.canvasWidth + (n + n9)] = !Mobile.isDoJa && this.getAlphaComponent() == 255 ? this.getColor() : this.blendPixels(this.getColor(), this.canvasData[(n2 + i) * this.canvasWidth + (n + n9)]);
                }
                if (i == 0 || i == n4 - 1 || n3 == 1) {
                    ++n9;
                    continue;
                }
                n9 += n3 - 1;
            }
        }
    }

    public void drawRoundRect(int n, int n2, int n3, int n4, int n5, int n6) {
        if (n3 < 0 || n4 < 0) {
            return;
        }
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        n5 = Math.abs(n5);
        n6 = Math.abs(n6);
        if (n5 % 2 != 0) {
            ++n5;
        }
        if (n6 % 2 != 0) {
            ++n6;
        }
        if (n5 >= n3) {
            n5 = n3 - 1;
        }
        if (n6 >= n4) {
            n6 = n4 - 1;
        }
        this.drawLine(n + n5 / 2 + 1, n2, n + n3 - n5 / 2 - 2, n2);
        this.drawLine(n + n5 / 2 + 1, n2 + n4, n + n3 - n5 / 2 - 2, n2 + n4);
        this.drawLine(n, n2 + n6 / 2 + 1, n, n2 + n4 - n6 / 2 - 2);
        this.drawLine(n + n3, n2 + n6 / 2 + 1, n + n3, n2 + n4 - n6 / 2 - 2);
        this.drawArc(n, n2, n5, n6, 90, 90);
        this.drawArc(n + n3 - n5 - 1, n2, n5, n6, 0, 90);
        this.drawArc(n, n2 + n4 - n6 - 1, n5, n6, 180, 90);
        this.drawArc(n + n3 - n5 - 1, n2 + n4 - n6 - 1, n5, n6, 270, 90);
    }

    public void drawString(String string, int n, int n2, int n3) {
        if (string == null || string.length() == 0) {
            return;
        }
        if (string.indexOf(10) < 0 && string.indexOf(13) < 0) {
            this.drawStringSingleLine(string, n, n2, n3);
            return;
        }
        int n4 = 0;
        n4 = Mobile.isDoJa ? this.dojaFont.getHeight() : this.font.getHeight();
        int n5 = 0;
        int n6 = 0;
        for (int i = 0; i <= string.length(); ++i) {
            boolean bl = i == string.length();
            char c = bl ? (char)'\u0000' : string.charAt(i);
            char c2 = c;
            if (!bl && c != '\n' && c != '\r') continue;
            String string2 = string.substring(n5, i);
            this.drawStringSingleLine(string2, n, n2 + n6 * n4, n3);
            ++n6;
            if (!bl && c == '\r' && i + 1 < string.length() && string.charAt(i + 1) == '\n') {
                ++i;
            }
            n5 = i + 1;
        }
    }

    private void drawStringSingleLine(String string, int n, int n2, int n3) {
        if (string != null && string.length() > 0) {
            int n4 = 0;
            int n5 = 0;
            if (Mobile.isDoJa) {
                n = this.AnchorX(n, this.dojaFont.stringWidth(string), n3);
                n4 = this.dojaFont.getAscent();
                n5 = this.dojaFont.getHeight();
            } else {
                n = this.AnchorX(n, this.font.stringWidth(string), n3);
                n4 = this.font.getBaselinePosition();
                n5 = this.font.getHeight();
            }
            n2 += n4;
            if ((n3 & 2) > 0) {
                n2 += n5 / 2;
            }
            if ((n3 & 0x20) > 0) {
                n2 -= n5;
            }
            if ((n3 & 0x40) > 0) {
                n2 -= n4;
            }
            this.gc.drawString(string, n, n2);
        }
    }

    public void drawSubstring(String string, int n, int n2, int n3, int n4, int n5) {
        if (string.length() >= n + n2) {
            this.drawString(string.substring(n, n + n2), n3, n4, n5);
        }
    }

    public void fillArc(int n, int n2, int n3, int n4, int n5, int n6) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        n6 = -n6;
        n5 = -n5;
        n += this.translateX;
        n2 += this.translateY;
        boolean bl = this.getAlphaComponent() < 255;
        int n7 = 0;
        byte[] byArray = null;
        if (bl) {
            byArray = new byte[(n3 + 1) * (n4 + 1) / 8];
        }
        int n8 = this.getClipX() + this.translateX < 0 ? 0 : this.getClipX() + this.translateX;
        int n9 = this.getClipY() + this.translateY < 0 ? 0 : this.getClipY() + this.translateY;
        int n10 = this.getClipWidth() + this.getClipX() + this.translateX > this.canvasWidth ? this.canvasWidth : this.getClipWidth() + this.getClipX() + this.translateX;
        int n11 = this.getClipHeight() + this.getClipY() + this.translateY > this.canvasHeight ? this.canvasHeight : this.getClipHeight() + this.getClipY() + this.translateY;
        float f = (float)n + (float)n3 / 2.0f;
        float f2 = (float)n2 + (float)n4 / 2.0f;
        float f3 = (float)n3 / 2.0f;
        float f4 = (float)n4 / 2.0f;
        float f5 = PlatformGraphics.fastToRadians(n5);
        float f6 = PlatformGraphics.fastToRadians(n5 + n6) - PlatformGraphics.fastToRadians(n5);
        float f7 = Math.max(f3, f4);
        int n12 = (int)Math.abs((float)(n6 * ((n3 + n4) / 2)) / 50.0f);
        for (int i = 0; i < n12; ++i) {
            float f8 = f5 + (float)i * f6 / (float)n12;
            for (float f9 = 0.0f; f9 < f7; f9 += 1.0f) {
                int n13 = (int)Math.round((double)f + (double)f3 * Math.cos(f8) * (double)(f9 / f7));
                int n14 = (int)Math.round((double)f2 + (double)f4 * Math.sin(f8) * (double)(f9 / f7));
                n7 = (n14 - n2) * n3 + n13 - n;
                if (n13 < n8 || n13 >= n10 || n14 < n9 || n14 >= n11 || n13 - n < 0 || n14 - n2 < 0 || bl && (byArray[n7 >> 3] & 1 << (7 - n7 & 7)) != 0) continue;
                if (!bl) {
                    this.canvasData[n14 * this.canvasWidth + n13] = this.getColor();
                    continue;
                }
                int n15 = n7 >> 3;
                byArray[n15] = (byte)(byArray[n15] | 1 << (7 - n7 & 7));
                this.canvasData[n14 * this.canvasWidth + n13] = this.blendPixels(this.getColor(), this.canvasData[n14 * this.canvasWidth + n13]);
            }
        }
    }

    public void fillRect(int n, int n2, int n3, int n4) {
        if (n3 < 0 || n4 < 0) {
            return;
        }
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        n += this.translateX;
        int n5 = this.getClipX() + this.translateX < 0 ? 0 : this.getClipX() + this.translateX;
        int n6 = this.getClipY() + this.translateY < 0 ? 0 : this.getClipY() + this.translateY;
        int n7 = this.getClipWidth() + this.getClipX() + this.translateX > this.canvasWidth ? this.canvasWidth : this.getClipWidth() + this.getClipX() + this.translateX;
        int n8 = this.getClipHeight() + this.getClipY() + this.translateY > this.canvasHeight ? this.canvasHeight : this.getClipHeight() + this.getClipY() + this.translateY;
        int n9 = n8;
        if ((n2 += this.translateY) + n4 > n8) {
            n4 = n8 - n2;
        }
        if (n + n3 > n7) {
            n3 = n7 - n;
        }
        if (n3 == 0 || n4 == 0) {
            return;
        }
        int n10 = n > n5 ? 0 : n5 - n;
        int n11 = n2 > n6 ? 0 : n6 - n2;
        for (int i = n11; i < n4; ++i) {
            for (int j = n10; j < n3; ++j) {
                this.canvasData[(n2 + i) * this.canvasWidth + n + j] = !Mobile.isDoJa && this.getAlphaComponent() == 255 ? this.getColor() : this.blendPixels(this.getColor(), this.canvasData[(n2 + i) * this.canvasWidth + n + j]);
            }
        }
    }

    public void fillRoundRect(int n, int n2, int n3, int n4, int n5, int n6) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        n5 = Math.abs(n5);
        n6 = Math.abs(n6);
        if (n5 == 0 && n6 == 0) {
            this.fillRect(n, n2, n5, n6);
            return;
        }
        if (n5 % 2 != 0) {
            ++n5;
        }
        if (n6 % 2 != 0) {
            ++n6;
        }
        if (n5 >= n3) {
            n5 = n3 - 1;
        }
        if (n6 >= n4) {
            n6 = n4 - 1;
        }
        this.fillRect(n + n5 / 2 + 1, n2, n3 - n5 - 2, n4);
        this.fillRect(n, n2 + n6 / 2 + 1, n5 / 2 + 1, n4 - n6 - 2);
        this.fillRect(n + (n3 - n5 / 2) - 1, n2 + n6 / 2 + 1, n5 / 2 + 1, n4 - n6 - 2);
        this.fillArc(n, n2, n5, n6, 90, 90);
        this.fillArc(n + n3 - n5 - 1, n2, n5, n6, 0, 90);
        this.fillArc(n, n2 + n4 - n6 - 1, n5, n6, 180, 90);
        this.fillArc(n + n3 - n5 - 1, n2 + n4 - n6 - 1, n5, n6, 270, 90);
    }

    public void setColor(int n) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        if (!Mobile.isDoJa || Mobile.isDoJa && Mobile.DoJaVersion < 40) {
            this.setColor(n >> 16 & 0xFF, n >> 8 & 0xFF, n & 0xFF);
        } else {
            this.setAlphaRGB(n);
        }
    }

    public void setColor(int n, int n2, int n3) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.color = 0xFF000000 | n << 16 | n2 << 8 | n3;
        this.gc.setColor(new Color(this.color));
    }

    public void setGrayScale(int n) {
        this.setColor(n, n, n);
    }

    public int getGrayScale() {
        return (int)(0.299 * (double)this.getRedComponent() + 0.587 * (double)this.getGreenComponent() + 0.114 * (double)this.getBlueComponent());
    }

    public int getRedComponent() {
        return this.color >> 16 & 0xFF;
    }

    public int getGreenComponent() {
        return this.color >> 8 & 0xFF;
    }

    public int getBlueComponent() {
        return this.color & 0xFF;
    }

    public int getColor() {
        return this.color;
    }

    public int getDisplayColor(int n) {
        return n;
    }

    public Font getFont() {
        return this.font;
    }

    public void setStrokeStyle(int n) {
        if (n != this.strokeStyle) {
            this.strokeStyle = n;
        }
    }

    public int getStrokeStyle() {
        return this.strokeStyle;
    }

    public void setFont(Font font) {
        if (font == null) {
            font = Font.getDefaultFont();
        }
        this.font = font;
        this.gc.setFont(font.awtFont);
    }

    public void setClip(int n, int n2, int n3, int n4) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        if (!Mobile.isDoJa) {
            this.gc.setClip(n, n2, n3, n4);
        } else {
            this.gc.setClip(n - this.getTranslateX(), n2 - this.getTranslateY(), n3, n4);
        }
    }

    public void clipRect(int n, int n2, int n3, int n4) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.gc.clipRect(n, n2, n3, n4);
    }

    public int getTranslateX() {
        return this.translateX;
    }

    public int getTranslateY() {
        return this.translateY;
    }

    public int getClipHeight() {
        return this.gc.getClipBounds().height;
    }

    public int getClipWidth() {
        return this.gc.getClipBounds().width;
    }

    public int getClipX() {
        return this.gc.getClipBounds().x;
    }

    public int getClipY() {
        return this.gc.getClipBounds().y;
    }

    public void translate(int n, int n2) {
        this.translateX += n;
        this.translateY += n2;
        this.gc.translate(n, n2);
    }

    private int AnchorX(int n, int n2, int n3) {
        int n4 = n;
        if ((n3 & 1) > 0) {
            n4 = n - n2 / 2;
        }
        if ((n3 & 8) > 0) {
            n4 = n - n2;
        }
        if ((n3 & 4) > 0) {
            n4 = n;
        }
        return n4;
    }

    private int AnchorY(int n, int n2, int n3) {
        int n4 = n;
        if ((n3 & 2) > 0) {
            n4 = n - n2 / 2;
        }
        if ((n3 & 0x10) > 0) {
            n4 = n;
        }
        if ((n3 & 0x20) > 0) {
            n4 = n - n2;
        }
        if ((n3 & 0x40) > 0) {
            n4 = n + n2;
        }
        return n4;
    }

    public void setAlphaRGB(int n) {
        this.color = n;
        this.gc.setColor(new Color(this.color, true));
    }

    @Override
    public int getNativePixelFormat() {
        return 0;
    }

    @Override
    public int getAlphaComponent() {
        return this.color >> 24 & 0xFF;
    }

    @Override
    public void setARGBColor(int n) {
        this.setAlphaRGB(n);
    }

    @Override
    public void drawImage(Image image, int n, int n2, int n3, int n4) {
        if (Mobile.compatFantasyZoneFix) {
            this.setClip(this.getClipX() - this.getTranslateX(), this.getClipY() - this.getTranslateY(), this.getClipWidth(), this.getClipHeight());
        }
        BufferedImage bufferedImage = PlatformGraphics.manipulateImage(image.getCanvas(), n4);
        n = this.AnchorX(n, bufferedImage.getWidth(), n3);
        n2 = this.AnchorY(n2, bufferedImage.getHeight(), n3);
        int[] nArray = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
        this.drawRGB(nArray, 0, bufferedImage.getWidth(), n, n2, bufferedImage.getWidth(), bufferedImage.getHeight(), true);
        if (Mobile.compatFantasyZoneFix) {
            this.setClip(this.getClipX() - this.getTranslateX(), this.getClipY() - this.getTranslateY(), this.getClipWidth(), this.getClipHeight());
        }
    }

    @Override
    public void drawPixels(byte[] byArray, byte[] byArray2, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        if (n5 < 0 || n6 < 0) {
            throw new IllegalArgumentException("drawPixels(byte) received negative width or height");
        }
        if (byArray == null) {
            throw new NullPointerException("drawPixels(byte) received a null pixel array");
        }
        if (n < 0 || n >= byArray.length * 8) {
            throw new ArrayIndexOutOfBoundsException("drawPixels(byte) index out of bounds:" + n5 + " * " + n6 + "| pixels len:" + byArray.length * 8 + "| offset:" + n);
        }
        if (n5 == 0 || n6 == 0) {
            return;
        }
        int n9 = 0;
        int n10 = 255;
        BufferedImage bufferedImage = new BufferedImage(n5, n6, 2);
        int[] nArray = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
        switch (n8) {
            case -1: {
                int n11 = n / n2 % 8;
                for (int i = 0; i < n6; ++i) {
                    int n12 = i * n5;
                    int n13 = (n / n2 + i) / 8 * n2 + n % n2;
                    for (int j = 0; j < n5; ++j) {
                        if (n13 + j >= byArray.length) continue;
                        n9 = byArray[n13 + j] >> n11 & 1;
                        if (byArray2 != null) {
                            n10 = (byArray2[n13 + j] >> n11 & 1) << 1;
                            n10 *= 255;
                        }
                        n9 = (1 - n9) * 255;
                        nArray[n12 + j] = n10 << 24 | n9 << 16 | n9 << 8 | n9;
                    }
                    if (++n11 <= 7) continue;
                    n11 = 0;
                }
                break;
            }
            case 1: {
                int n14 = 7 - n % 8;
                for (int i = 0; i < n6; ++i) {
                    int n15 = n + i * n2;
                    int n16 = i * n5;
                    for (int j = 0; j < n5; ++j) {
                        if ((n15 + j) / 8 >= byArray.length) continue;
                        n9 = byArray[(n15 + j) / 8] >> n14 & 1;
                        if (byArray2 != null) {
                            n10 = (byArray2[(n15 + j) / 8] >> n14 & 1) << 1;
                            n10 *= 255;
                        }
                        n9 = (1 - n9) * 255;
                        nArray[n16 + j] = n10 << 24 | n9 << 16 | n9 << 8 | n9;
                        if (--n14 >= 0) continue;
                        n14 = 7;
                    }
                    if ((n14 -= (n2 - n5) % 8) >= 0) continue;
                    n14 = 8 + n14;
                }
                break;
            }
            case 2: {
                for (int i = 0; i < n6; ++i) {
                    int n17 = n + i * n2;
                    int n18 = i * n5;
                    for (int j = 0; j < n5; ++j) {
                        if (n17 + j / 4 >= byArray.length) continue;
                        n9 = byArray[n17 + j / 4] >> 6 - 2 * (j % 4) & 3;
                        if (byArray2 != null) {
                            n10 = byArray2[n17 + j / 4] >> 6 - 2 * (j % 4) & 3;
                            n10 *= 85;
                        }
                        n9 = (3 - n9) * 85;
                        nArray[n18 + j] = n10 << 24 | n9 << 16 | n9 << 8 | n9;
                    }
                }
                break;
            }
            case 332: {
                for (int i = 0; i < n6; ++i) {
                    int n19 = n + i * n2;
                    int n20 = i * n5;
                    for (int j = 0; j < n5; ++j) {
                        if (n19 + j >= byArray.length) continue;
                        n9 = byArray[n19 + j] & 0xFF;
                        int n21 = n9 >> 5 & 7;
                        int n22 = n9 >> 2 & 7;
                        int n23 = n9 & 3;
                        n21 = n21 * 255 / 7;
                        n22 = n22 * 255 / 7;
                        n23 *= 85;
                        if (byArray2 != null) {
                            n10 = byArray2[n19 + j] & 0xFF;
                        }
                        nArray[n20 + j] = n10 << 24 | n21 << 16 | n22 << 8 | n23;
                    }
                }
                break;
            }
            case 4: {
                for (int i = 0; i < n6; ++i) {
                    int n24 = n + i * n2;
                    int n25 = i * n5;
                    for (int j = 0; j < n5; ++j) {
                        if (n24 + j / 2 >= byArray.length) continue;
                        n9 = byArray[n24 + j / 2] >> 4 * (1 - j % 2) & 0xF;
                        if (byArray2 != null) {
                            n10 = byArray2[n24 + j / 2] >> 4 * (1 - j % 2) & 0xF;
                            n10 *= 17;
                        }
                        n9 = (15 - n9) * 17;
                        nArray[n25 + j] = n10 << 24 | n9 << 16 | n9 << 8 | n9;
                    }
                }
                break;
            }
            case 8: {
                for (int i = 0; i < n6; ++i) {
                    int n26 = n + i * n2;
                    int n27 = i * n5;
                    for (int j = 0; j < n5; ++j) {
                        if (n26 + j >= byArray.length) continue;
                        n9 = 255 - (byArray[n26 + j] & 0xFF);
                        if (byArray2 != null) {
                            n10 = byArray2[n26 + j] & 0xFF;
                        }
                        nArray[n27 + j] = n10 << 24 | n9 << 16 | n9 << 8 | n9;
                    }
                }
                break;
            }
            default: {
                throw new IllegalArgumentException("Unsupported format: " + n8);
            }
        }
        bufferedImage = PlatformGraphics.manipulateImage(bufferedImage, n7);
        nArray = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
        this.drawRGB(nArray, 0, bufferedImage.getWidth(), n3, n4, bufferedImage.getWidth(), bufferedImage.getHeight(), true);
    }

    @Override
    public void drawPixels(int[] nArray, boolean bl, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        if (n5 < 0 || n6 < 0) {
            throw new IllegalArgumentException("drawPixels(int) received negative width or height");
        }
        if (nArray == null) {
            throw new NullPointerException("drawPixels(int) received a null pixel array");
        }
        if (n < 0 || n >= nArray.length) {
            throw new ArrayIndexOutOfBoundsException("drawPixels(int) index out of bounds:" + n5 + " * " + n6 + "| len:" + nArray.length);
        }
        if (n5 == 0 || n6 == 0) {
            return;
        }
        BufferedImage bufferedImage = new BufferedImage(n5, n6, 2);
        int[] nArray2 = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
        for (int i = 0; i < n6; ++i) {
            int n9 = n + i * n2;
            for (int j = 0; j < n5; ++j) {
                if (n9 + j >= nArray.length) continue;
                if (!bl) {
                    int n10 = n9 + j;
                    nArray[n10] = nArray[n10] | 0xFF000000;
                }
                nArray2[i * n5 + j] = nArray[n9 + j];
            }
        }
        bufferedImage = PlatformGraphics.manipulateImage(bufferedImage, n7);
        nArray2 = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
        this.drawRGB(nArray2, 0, bufferedImage.getWidth(), n3, n4, bufferedImage.getWidth(), bufferedImage.getHeight(), bl);
    }

    @Override
    public void drawPixels(short[] sArray, boolean bl, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        if (n5 < 0 || n6 < 0) {
            throw new IllegalArgumentException("drawPixels(short) received negative width or height");
        }
        if (sArray == null) {
            throw new NullPointerException("drawPixels(short) received a null pixel array");
        }
        if (n < 0 || n >= sArray.length) {
            throw new ArrayIndexOutOfBoundsException("drawPixels(short) index out of bounds:" + n5 + " * " + n6 + "| len:" + sArray.length);
        }
        if (n5 == 0 || n6 == 0) {
            return;
        }
        BufferedImage bufferedImage = new BufferedImage(n5, n6, 2);
        int[] nArray = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
        for (int i = 0; i < n6; ++i) {
            int n9 = n + i * n2;
            for (int j = 0; j < n5; ++j) {
                if (n9 + j >= sArray.length) continue;
                nArray[i * n5 + j] = this.pixelToColor(sArray[n9 + j], n8);
                if (bl) continue;
                int n10 = i * n5 + j;
                nArray[n10] = nArray[n10] | 0xFF000000;
            }
        }
        bufferedImage = PlatformGraphics.manipulateImage(bufferedImage, n7);
        nArray = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
        this.drawRGB(nArray, 0, bufferedImage.getWidth(), n3, n4, bufferedImage.getWidth(), bufferedImage.getHeight(), bl);
    }

    @Override
    public void drawPolygon(int[] nArray, int n, int[] nArray2, int n2, int n3, int n4) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        int n5 = this.color;
        this.setAlphaRGB(n4);
        for (int i = 0; i < n3; ++i) {
            if (i == n3 - 1) {
                this.drawLine(nArray[n + i], nArray2[n2 + i], nArray[n], nArray2[n2]);
                continue;
            }
            this.drawLine(nArray[n + i], nArray2[n2 + i], nArray[n + i + 1], nArray2[n2 + i + 1]);
        }
        this.setAlphaRGB(n5);
    }

    public void drawTriangle(int n, int n2, int n3, int n4, int n5, int n6) {
        this.drawTriangle(n, n2, n3, n4, n5, n6, this.getColor());
    }

    @Override
    public void drawTriangle(int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        int n8 = this.color;
        this.setAlphaRGB(n7);
        this.drawLine(n, n2, n3, n4);
        this.drawLine(n3, n4, n5, n6);
        this.drawLine(n5, n6, n, n2);
        this.setAlphaRGB(n8);
    }

    @Override
    public void fillPolygon(int[] nArray, int n, int[] nArray2, int n2, int n3, int n4) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        if (n3 < 3) {
            return;
        }
        int n5 = this.getClipX() + this.translateX < 0 ? 0 : this.getClipX() + this.translateX;
        int n6 = this.getClipY() + this.translateY < 0 ? 0 : this.getClipY() + this.translateY;
        int n7 = this.getClipWidth() + this.getClipX() + this.translateX > this.canvasWidth ? this.canvasWidth : this.getClipWidth() + this.getClipX() + this.translateX;
        int n8 = this.getClipHeight() + this.getClipY() + this.translateY > this.canvasHeight ? this.canvasHeight : this.getClipHeight() + this.getClipY() + this.translateY;
        int n9 = Integer.MAX_VALUE;
        int n10 = Integer.MIN_VALUE;
        for (int i = 0; i < n3; ++i) {
            if (nArray2[i + n2] < n9) {
                n9 = nArray2[i + n2];
            }
            if (nArray2[i + n2] <= n10) continue;
            n10 = nArray2[i + n2];
        }
        if (n9 + this.translateY < n6) {
            n9 = n6 - this.translateY;
        }
        if (n10 + this.translateY >= n8) {
            n10 = n8 - this.translateY;
        }
        int[] nArray3 = new int[n3];
        int n11 = 0;
        for (int i = n9; i < n10; ++i) {
            int n12;
            int n13;
            int n14;
            int n15;
            n11 = 0;
            for (n15 = 0; n15 < n3; ++n15) {
                n14 = (n15 + 1) % n3;
                if ((nArray2[n15 + n2] > i || nArray2[n14 + n2] <= i) && (nArray2[n14 + n2] > i || nArray2[n15 + n2] <= i) || (n13 = nArray2[n14 + n2] - nArray2[n15 + n2]) == 0) continue;
                n12 = nArray[n15 + n] * n13 + (i - nArray2[n15 + n2]) * (nArray[n14 + n] - nArray[n15 + n]);
                nArray3[n11++] = n12 /= n13;
            }
            for (n15 = 0; n15 < n11 - 1; ++n15) {
                for (n14 = 0; n14 < n11 - 1 - n15; ++n14) {
                    if (nArray3[n14] <= nArray3[n14 + 1]) continue;
                    n13 = nArray3[n14];
                    nArray3[n14] = nArray3[n14 + 1];
                    nArray3[n14 + 1] = n13;
                }
            }
            for (n15 = 0; n15 < n11; n15 += 2) {
                if (n15 + 1 >= n11) continue;
                n14 = nArray3[n15] + this.translateX;
                n13 = nArray3[n15 + 1] + this.translateX;
                if (n14 < n5) {
                    n14 = n5;
                }
                if (n13 > n7) {
                    n13 = n7;
                }
                for (n12 = n14; n12 < n13; ++n12) {
                    this.canvasData[(i + this.translateY) * this.canvasWidth + n12] = (n4 >> 24 & 0xFF) == 255 ? n4 : this.blendPixels(n4, this.canvasData[(i + this.translateY) * this.canvasWidth + n12]);
                }
            }
        }
    }

    public void fillTriangle(int n, int n2, int n3, int n4, int n5, int n6) {
        this.fillTriangle(n, n2, n3, n4, n5, n6, this.getColor());
    }

    @Override
    public void fillTriangle(int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        this.fillPolygon(new int[]{n, n3, n5}, 0, new int[]{n2, n4, n6}, 0, 3, n7);
    }

    @Override
    public void getPixels(byte[] byArray, byte[] byArray2, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        if (byArray == null) {
            throw new NullPointerException("Byte array cannot be null");
        }
        if ((n3 += this.getTranslateX()) < 0 || (n4 += this.getTranslateY()) < 0 || n6 < 0 || n5 < 0) {
            throw new IllegalArgumentException("Invalid width,height,x or y");
        }
        if (n3 < 0 || n4 < 0 || n5 * n6 > byArray.length) {
            throw new ArrayIndexOutOfBoundsException("Requested copy area exceeds bounds of the image");
        }
        if (n3 + n5 >= this.canvasWidth) {
            n5 = this.canvasWidth - n3;
        }
        if (n4 + n6 >= this.canvasHeight) {
            n6 = this.canvasHeight - n4;
        }
        switch (n7) {
            case -1: {
                for (int i = 0; i < n6; ++i) {
                    for (int j = 0; j < n5; ++j) {
                        int n8 = (n4 + i) * this.canvasWidth + (n3 + j);
                        int n9 = this.canvasData[n8];
                        int n10 = (n + i) * n2 + j / 8;
                        int n11 = j % 8;
                        int n12 = n10;
                        byArray[n12] = (byte)(byArray[n12] | ((n9 & 0xFF) != 0 ? 0 : 1) << 7 - n11);
                        if (byArray2 == null) continue;
                        int n13 = n10;
                        byArray2[n13] = (byte)(byArray2[n13] | ((n9 & 0xFF000000) != 0 ? 0 : 1) << 7 - n11);
                    }
                }
                break;
            }
            case 1: {
                for (int i = 0; i < n6; ++i) {
                    for (int j = 0; j < n5; ++j) {
                        int n14 = (n4 + i) * this.canvasWidth + (n3 + j);
                        int n15 = this.canvasData[n14];
                        int n16 = n / 8 + (i * n5 + j) / 8;
                        int n17 = (i * n5 + j) % 8;
                        int n18 = n16;
                        byArray[n18] = (byte)(byArray[n18] | ((n15 & 0xFF) != 0 ? 0 : 1) << 7 - n17);
                        if (byArray2 == null) continue;
                        int n19 = n16;
                        byArray2[n19] = (byte)(byArray2[n19] | ((n15 & 0xFF000000) != 0 ? 0 : 1) << 7 - n17);
                    }
                }
                break;
            }
            case 2: {
                for (int i = 0; i < n6; ++i) {
                    for (int j = 0; j < n5; ++j) {
                        int n20 = (n4 + i) * this.canvasWidth + (n3 + j);
                        int n21 = this.canvasData[n20];
                        int n22 = (n + i) * n2 + j / 4;
                        int n23 = j % 4;
                        int n24 = n21 & 0xFF;
                        int n25 = n24 / 85;
                        int n26 = n22;
                        byArray[n26] = (byte)(byArray[n26] | n25 << 6 - 2 * n23);
                        if (byArray2 == null) continue;
                        int n27 = n21 >> 24 & 0xFF;
                        int n28 = n27 / 85;
                        int n29 = n22;
                        byArray2[n29] = (byte)(byArray2[n29] | n28 << 6 - 2 * n23);
                    }
                }
                break;
            }
            case 332: {
                for (int i = 0; i < n6; ++i) {
                    for (int j = 0; j < n5; ++j) {
                        int n30 = (n4 + i) * this.canvasWidth + (n3 + j);
                        int n31 = this.canvasData[n30];
                        int n32 = (n + i) * n2 + j;
                        int n33 = n31 >> 16 & 0xFF;
                        int n34 = n31 >> 8 & 0xFF;
                        int n35 = n31 & 0xFF;
                        int n36 = n33 * 7 / 255 << 5 | n34 * 7 / 255 << 2 | n35 * 3 / 255;
                        byArray[n32] = (byte)n36;
                        if (byArray2 == null) continue;
                        int n37 = n31 >> 24 & 0xFF;
                        byArray2[n32] = (byte)n37;
                    }
                }
                break;
            }
            case 4: {
                for (int i = 0; i < n6; ++i) {
                    for (int j = 0; j < n5; ++j) {
                        int n38 = (n4 + i) * this.canvasWidth + (n3 + j);
                        int n39 = this.canvasData[n38];
                        int n40 = (n + i) * n2 + j / 2;
                        int n41 = j % 2;
                        int n42 = n39 & 0xFF;
                        int n43 = n42 / 17;
                        int n44 = n40;
                        byArray[n44] = (byte)(byArray[n44] | n43 << 4 * (1 - n41));
                        if (byArray2 == null) continue;
                        int n45 = n39 >> 24 & 0xFF;
                        int n46 = n45 / 17;
                        int n47 = n40;
                        byArray2[n47] = (byte)(byArray2[n47] | n46 << 4 * (1 - n41));
                    }
                }
                break;
            }
            case 8: {
                for (int i = 0; i < n6; ++i) {
                    for (int j = 0; j < n5; ++j) {
                        int n48 = (n4 + i) * this.canvasWidth + (n3 + j);
                        int n49 = this.canvasData[n48];
                        int n50 = (n + i) * n2 + j;
                        int n51 = n49 & 0xFF;
                        byArray[n50] = (byte)n51;
                        if (byArray2 == null) continue;
                        int n52 = n49 >> 24 & 0xFF;
                        byArray2[n50] = (byte)n52;
                    }
                }
                break;
            }
            default: {
                throw new IllegalArgumentException("Unsupported format: " + n7);
            }
        }
    }

    @Override
    public void getPixels(int[] nArray, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        if (nArray == null) {
            throw new NullPointerException("int array cannot be null");
        }
        if ((n3 += this.getTranslateX()) < 0 || (n4 += this.getTranslateY()) < 0 || n6 < 0 || n5 < 0) {
            throw new IllegalArgumentException("Invalid width,height,x or y");
        }
        if (n3 < 0 || n4 < 0 || n5 * n6 > nArray.length) {
            throw new ArrayIndexOutOfBoundsException("Requested copy area exceeds bounds of the image");
        }
        if (n3 + n5 >= this.canvasWidth) {
            n5 = this.canvasWidth - n3;
        }
        if (n4 + n6 >= this.canvasHeight) {
            n6 = this.canvasHeight - n4;
        }
        for (int i = 0; i < n6; ++i) {
            for (int j = 0; j < n5; ++j) {
                int n8 = this.canvasData[j + n3 + (i + n4) * this.canvasWidth];
                int n9 = n + j + i * n2;
                nArray[n9] = this.blendPixels(n8, nArray[n9]);
            }
        }
    }

    @Override
    public void getPixels(short[] sArray, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        if (sArray == null) {
            throw new NullPointerException("short array cannot be null");
        }
        if ((n3 += this.getTranslateX()) < 0 || (n4 += this.getTranslateY()) < 0 || n6 < 0 || n5 < 0) {
            throw new IllegalArgumentException("Invalid width,height,x or y");
        }
        if (n3 < 0 || n4 < 0 || n5 * n6 > sArray.length) {
            throw new ArrayIndexOutOfBoundsException("Requested copy area exceeds bounds of the image");
        }
        if (n3 + n5 >= this.canvasWidth) {
            n5 = this.canvasWidth - n3;
        }
        if (n4 + n6 >= this.canvasHeight) {
            n6 = this.canvasHeight - n4;
        }
        for (int i = 0; i < n6; ++i) {
            for (int j = 0; j < n5; ++j) {
                int n8 = this.canvasData[j + n3 + (i + n4) * this.canvasWidth];
                int n9 = n + j + i * n2;
                sArray[n9] = this.colorToShortPixel(this.blendPixels(n8, this.pixelToColor(sArray[n9], n7)), n7);
            }
        }
    }

    private int pixelToColor(short s, int n) {
        int n2 = 255;
        int n3 = 0;
        int n4 = 0;
        int n5 = 0;
        if (n == 0) {
            n = 4444;
        }
        switch (n) {
            case 1555: {
                n2 = (s >> 15 & 1) * 255;
                n3 = s >> 10 & 0x1F;
                n4 = s >> 5 & 0x1F;
                n5 = s & 0x1F;
                n3 = n3 << 3 | n3 >> 2;
                n4 = n4 << 3 | n4 >> 2;
                n5 = n5 << 3 | n5 >> 2;
                break;
            }
            case 444: {
                n3 = s >> 8 & 0xF;
                n4 = s >> 4 & 0xF;
                n5 = s & 0xF;
                n3 = n3 << 4 | n3;
                n4 = n4 << 4 | n4;
                n5 = n5 << 4 | n5;
                break;
            }
            case 4444: {
                n2 = s >> 12 & 0xF;
                n3 = s >> 8 & 0xF;
                n4 = s >> 4 & 0xF;
                n5 = s & 0xF;
                n2 = n2 << 4 | n2;
                n3 = n3 << 4 | n3;
                n4 = n4 << 4 | n4;
                n5 = n5 << 4 | n5;
                break;
            }
            case 555: {
                n3 = s >> 10 & 0x1F;
                n4 = s >> 5 & 0x1F;
                n5 = s & 0x1F;
                n3 = n3 << 3 | n3 >> 2;
                n4 = n4 << 3 | n4 >> 2;
                n5 = n5 << 3 | n5 >> 2;
                break;
            }
            case 565: {
                n3 = s >> 11 & 0x1F;
                n4 = s >> 5 & 0x3F;
                n5 = s & 0x1F;
                n3 = n3 << 3 | n3 >> 2;
                n4 = n4 << 2 | n4 >> 4;
                n5 = n5 << 3 | n5 >> 2;
                break;
            }
            default: {
                throw new IllegalArgumentException("Unsupported format: " + n);
            }
        }
        return n2 << 24 | n3 << 16 | n4 << 8 | n5;
    }

    private short colorToShortPixel(int n, int n2) {
        if (n2 == 0) {
            n2 = 4444;
        }
        switch (n2) {
            case 1555: {
                int n3 = n >>> 31 & 1;
                int n4 = n >> 19 & 0x1F;
                int n5 = n >> 11 & 0x1F;
                int n6 = n >> 3 & 0x1F;
                return (short)(n3 << 15 | n4 << 10 | n5 << 5 | n6);
            }
            case 444: {
                int n7 = n >> 20 & 0xF;
                int n8 = n >> 12 & 0xF;
                int n9 = n >> 4 & 0xF;
                return (short)(n7 << 8 | n8 << 4 | n9);
            }
            case 4444: {
                int n10 = n >>> 28 & 0xF;
                int n11 = n >> 20 & 0xF;
                int n12 = n >> 12 & 0xF;
                int n13 = n >> 4 & 0xF;
                return (short)(n10 << 12 | n11 << 8 | n12 << 4 | n13);
            }
            case 555: {
                int n14 = n >> 19 & 0x1F;
                int n15 = n >> 11 & 0x1F;
                int n16 = n >> 3 & 0x1F;
                return (short)(n14 << 10 | n15 << 5 | n16);
            }
            case 565: {
                int n17 = n >> 19 & 0x1F;
                int n18 = n >> 10 & 0x3F;
                int n19 = n >> 3 & 0x1F;
                return (short)(n17 << 11 | n18 << 5 | n19);
            }
        }
        throw new IllegalArgumentException("Unsupported format: " + n2);
    }

    private static final BufferedImage manipulateImage(BufferedImage bufferedImage, int n) {
        if (n == 0 || n == 24756) {
            return bufferedImage;
        }
        switch (n) {
            case 1: 
            case 8192: 
            case 16564: {
                return PlatformImage.transformImage(bufferedImage, 2);
            }
            case 2: 
            case 8372: 
            case 16384: {
                return PlatformImage.transformImage(bufferedImage, 1);
            }
            case 4: 
            case 90: 
            case 24846: {
                return PlatformImage.transformImage(bufferedImage, 6);
            }
            case 3: 
            case 180: 
            case 24576: {
                return PlatformImage.transformImage(bufferedImage, 3);
            }
            case 5: 
            case 270: 
            case 24666: {
                return PlatformImage.transformImage(bufferedImage, 5);
            }
            case 7: 
            case 8282: 
            case 16654: {
                return PlatformImage.transformImage(bufferedImage, 7);
            }
            case 6: 
            case 8462: 
            case 16474: {
                return PlatformImage.transformImage(bufferedImage, 4);
            }
        }
        Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": manipulateImage " + n + " not defined");
        return bufferedImage;
    }

    private final int blendPixels(int n, int n2) {
        int n3 = n >> 24 & 0xFF;
        int n4 = 0;
        int n5 = 0;
        int n6 = 0;
        if (n3 == 0) {
            return n2;
        }
        switch (this.renderMode) {
            case 0: {
                if (n3 == 255) {
                    return n;
                }
                int n7 = n2 >> 24 & 0xFF;
                int n8 = 255 - n3;
                int n9 = n3 + n7 > 255 ? 255 : n3 + n7;
                n4 = ((n >> 16 & 0xFF) * n3 + (n2 >> 16 & 0xFF) * n8) / 255;
                n5 = ((n >> 8 & 0xFF) * n3 + (n2 >> 8 & 0xFF) * n8) / 255;
                n6 = ((n & 0xFF) * n3 + (n2 & 0xFF) * n8) / 255;
                return n9 << 24 | n4 << 16 | n5 << 8 | n6;
            }
            case 1: {
                n4 = PlatformGraphics.clamp((n2 >> 16 & 0xFF) * this.dstRatio / 255 + (n >> 16 & 0xFF) * this.srcRatio / 255);
                n5 = PlatformGraphics.clamp((n2 >> 8 & 0xFF) * this.dstRatio / 255 + (n >> 8 & 0xFF) * this.srcRatio / 255);
                n6 = PlatformGraphics.clamp((n2 & 0xFF) * this.dstRatio / 255 + (n & 0xFF) * this.srcRatio / 255);
                return 0xFF000000 | n4 << 16 | n5 << 8 | n6;
            }
            case 2: {
                n4 = PlatformGraphics.clamp((n2 >> 16 & 0xFF) * this.dstRatio / 255 - (n >> 16 & 0xFF) * this.srcRatio / 255);
                n5 = PlatformGraphics.clamp((n2 >> 8 & 0xFF) * this.dstRatio / 255 - (n >> 8 & 0xFF) * this.srcRatio / 255);
                n6 = PlatformGraphics.clamp((n2 & 0xFF) * this.dstRatio / 255 - (n & 0xFF) * this.srcRatio / 255);
                return 0xFF000000 | n4 << 16 | n5 << 8 | n6;
            }
        }
        return n;
    }

    public void drawFunLights(int[] nArray, int n, int n2) {
        for (int i = 0; i < n2; ++i) {
            for (int j = 0; j < n; ++j) {
                if (j < n / 2 && i >= n2 - Mobile.funLightRegionSize / 2) {
                    if (i >= n2) continue;
                    nArray[i * n + j] = Mobile.funLightRegionColor[2];
                    continue;
                }
                if (j >= n / 2 && i >= n2 - Mobile.funLightRegionSize / 2) {
                    if (i >= n2) continue;
                    nArray[i * n + j] = Mobile.funLightRegionColor[3];
                    continue;
                }
                if (j < Mobile.funLightRegionSize / 2 - 2) {
                    nArray[i * n + j] = Mobile.funLightRegionColor[4];
                    continue;
                }
                if (j < n - Mobile.funLightRegionSize / 2) continue;
                nArray[i * n + j] = Mobile.funLightRegionColor[4];
            }
        }
        this.applyGaussianBlur(nArray, n, n2);
    }

    private void applyGaussianBlur(int[] nArray, int n, int n2) {
        int n3;
        float f;
        int n4;
        int n5;
        int n6;
        float f2;
        float f3;
        float f4;
        float f5;
        float f6;
        int n7;
        int n8;
        int[] nArray2 = new int[nArray.length];
        for (n8 = 0; n8 < n2; ++n8) {
            for (n7 = 0; n7 < n; ++n7) {
                if (n7 > Mobile.funLightRegionSize - 3 && n7 < n - Mobile.funLightRegionSize + 3 && n8 < n2 - Mobile.funLightRegionSize + 3) continue;
                f6 = 0.0f;
                f5 = 0.0f;
                f4 = 0.0f;
                f3 = 0.0f;
                f2 = 0.0f;
                for (n6 = -3; n6 <= 3; ++n6) {
                    n5 = n7 + n6;
                    if (n5 < 0 || n5 >= n) continue;
                    n4 = nArray[n8 * n + n5];
                    f = (float)gaussianKernel[n6 + 3] / 159.0f;
                    f6 += (float)(n4 >> 16 & 0xFF) * f;
                    f5 += (float)(n4 >> 8 & 0xFF) * f;
                    f4 += (float)(n4 & 0xFF) * f;
                    f3 += (float)(n4 >> 24 & 0xFF) * f;
                    f2 += f;
                }
                n6 = f3 / f2 < 255.0f ? (int)(f3 / f2) : 255;
                n5 = f6 / f2 < 255.0f ? (int)(f6 / f2) : 255;
                n4 = f5 / f2 < 255.0f ? (int)(f5 / f2) : 255;
                n3 = f4 / f2 < 255.0f ? (int)(f4 / f2) : 255;
                nArray2[n8 * n + n7] = n6 << 24 | n5 << 16 | n4 << 8 | n3;
            }
        }
        for (n8 = 0; n8 < n; ++n8) {
            for (n7 = 0; n7 < n2; ++n7) {
                if (n8 > Mobile.funLightRegionSize - 3 && n8 < n - Mobile.funLightRegionSize + 3 && n7 < n2 - Mobile.funLightRegionSize + 3) continue;
                f6 = 0.0f;
                f5 = 0.0f;
                f4 = 0.0f;
                f3 = 0.0f;
                f2 = 0.0f;
                for (n6 = -3; n6 <= 3; ++n6) {
                    n5 = n7 + n6;
                    if (n5 < 0 || n5 >= n2) continue;
                    n4 = nArray2[n5 * n + n8];
                    f = (float)gaussianKernel[n6 + 3] / 159.0f;
                    f6 += (float)(n4 >> 16 & 0xFF) * f;
                    f5 += (float)(n4 >> 8 & 0xFF) * f;
                    f4 += (float)(n4 & 0xFF) * f;
                    f3 += (float)(n4 >> 24 & 0xFF) * f;
                    f2 += f;
                }
                n6 = f3 / f2 < 255.0f ? (int)(f3 / f2) : 255;
                n5 = f6 / f2 < 255.0f ? (int)(f6 / f2) : 255;
                n4 = f5 / f2 < 255.0f ? (int)(f5 / f2) : 255;
                n3 = f4 / f2 < 255.0f ? (int)(f4 / f2) : 255;
                nArray2[n7 * n + n8] = n6 << 24 | n5 << 16 | n4 << 8 | n3;
            }
        }
        System.arraycopy(nArray2, 0, nArray, 0, nArray.length);
    }

    public void dispose() {
        this.contextDisposed = true;
        this.canvasData = null;
        this.baseImage = null;
        this.canvas = null;
        this.gc.dispose();
    }

    public Graphics copy() {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        Graphics graphics = new Graphics(this.baseImage);
        graphics.translate(this.getTranslateX(), this.getTranslateY());
        graphics.setClip(this.getClipX(), this.getClipY(), this.getClipWidth(), this.getClipHeight());
        graphics.setColor(this.color);
        graphics.setStrokeStyle(this.getStrokeStyle());
        return graphics;
    }

    public void copyArea(int n, int n2, int n3, int n4, int n5, int n6) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.copyArea(n, n2, n3, n4, n5, n6, 0);
    }

    public void drawChars(char[] cArray, int n, int n2, int n3, int n4) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        if (cArray == null) {
            throw new NullPointerException("Null char array received");
        }
        if (n3 < 0 || n4 < 0 || n3 + n4 >= cArray.length) {
            throw new StringIndexOutOfBoundsException("invalid length and/or position received");
        }
        this.drawChars(cArray, n3, n4, n, n2, 64);
    }

    public void drawString(String string, int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        if (string == null) {
            throw new NullPointerException("Null string received");
        }
        if (string.length() > 0) {
            this.drawString(string, n, n2, 64);
        }
    }

    public void drawImage(com.nttdocomo.ui.Image image, int[] nArray) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        try {
            float[] fArray = new float[nArray.length];
            for (int i = 0; i < nArray.length; ++i) {
                fArray[i] = nArray[i];
            }
            AffineTransform affineTransform = new AffineTransform(fArray);
            this.gc.setTransform(affineTransform);
            this.drawScaledImage(image, 0, 0, image.getWidth(), image.getHeight(), 0, 0, image.getWidth(), image.getHeight());
        }
        catch (Exception exception) {
            Mobile.log((byte)4, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawImage with matrix: " + exception.getMessage());
        }
    }

    public void drawImage(com.nttdocomo.ui.Image image, int[] nArray, int n, int n2, int n3, int n4) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        try {
            float[] fArray = new float[nArray.length];
            for (int i = 0; i < nArray.length; ++i) {
                fArray[i] = nArray[i];
            }
            AffineTransform affineTransform = new AffineTransform(fArray);
            this.gc.setTransform(affineTransform);
            this.drawScaledImage(image, n, n2, n3, n4, n, n2, n3, n4);
        }
        catch (Exception exception) {
            Mobile.log((byte)4, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawImage with matrix and part: " + exception.getMessage());
        }
    }

    public void drawImage(com.nttdocomo.ui.Image image, int n, int n2) {
        this.drawScaledImage(image, n, n2, image.getWidth(), image.getHeight(), 0, 0, image.getWidth(), image.getHeight());
    }

    public void drawImage(com.nttdocomo.ui.Image image, int n, int n2, int n3, int n4, int n5, int n6) {
        this.drawScaledImage(image, n, n2, n5, n6, n3, n4, n5, n6);
    }

    private int[] adjustCoordinates(int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        int n8;
        if (n7 == 4 || n7 == 5 || n7 == 6 || n7 == 7) {
            n8 = n6;
            n5 = n6 = n5;
        }
        switch (n7) {
            case 1: {
                n3 = n - n3 - n5;
                break;
            }
            case 2: {
                n4 = n2 - n4 - n6;
                break;
            }
            case 5: {
                n8 = n3;
                n3 = n2 - n4 - n5;
                n4 = n8;
                break;
            }
            case 4: {
                int n9 = n4;
                n4 = n - n3 - n6;
                n3 = n9;
                break;
            }
            case 3: {
                n3 = n - n3 - n5;
                n4 = n2 - n4 - n6;
                break;
            }
            case 7: {
                Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": DoJa FLIP_ROTATE_RIGHT_VERTICAL untested");
                int n10 = n4;
                n4 = n - n3 - n6;
                n3 = n2 - n10 - n5;
                break;
            }
            case 6: {
                Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": DoJa FLIP_ROTATE_RIGHT_HORIZONTAL untested");
                n8 = n3;
                n3 = n4;
                n4 = n8;
            }
        }
        return new int[]{n3, n4, n5, n6};
    }

    public void setOrigin(int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.translate(n - this.translateX, n2 - this.translateY);
    }

    public void clearClip() {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.setClip(0, 0, this.canvasWidth, this.canvasHeight);
    }

    public void setFont(com.nttdocomo.ui.Font font) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        if (font == null) {
            font = com.nttdocomo.ui.Font.getDefaultFont();
        }
        this.dojaFont = font;
        this.gc.setFont(font.awtFont);
    }

    public void lock() {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        ++this.dojaLockCount;
    }

    public void unlock(boolean bl) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.dojaLockCount = bl ? 0 : this.dojaLockCount - 1;
        int n = this.dojaLockCount;
        if (this.dojaLockCount == 0 && Display.getCurrent() instanceof Canvas) {
            ((Canvas)Display.getCurrent()).repaint();
        }
    }

    public static int getColorOfRGB(int n, int n2, int n3) {
        return PlatformGraphics.getColorOfRGB(n, n2, n3, Mobile.DoJaVersion >= 40 ? 255 : 0);
    }

    public static int getColorOfRGB(int n, int n2, int n3, int n4) {
        if (n4 < 0 || n4 > 255 || n < 0 || n > 255 || n2 < 0 || n2 > 255 || n3 < 0 || n3 > 255) {
            throw new IllegalArgumentException("RGB values must be between 0 and 255");
        }
        return n4 << 24 | n << 16 | n2 << 8 | n3;
    }

    public static int getColorOfName(int n) {
        int n2 = Mobile.DoJaVersion >= 40 ? -16777216 : 0;
        switch (n) {
            case 0: {
                return 0 | n2;
            }
            case 1: {
                return 0xFF | n2;
            }
            case 2: {
                return 0xFF00 | n2;
            }
            case 3: {
                return 0xFFFF | n2;
            }
            case 4: {
                return 0xFF0000 | n2;
            }
            case 5: {
                return 0xFF00FF | n2;
            }
            case 6: {
                return 0xFFFF00 | n2;
            }
            case 7: {
                return 0xFFFFFF | n2;
            }
            case 8: {
                return 0x808080 | n2;
            }
            case 9: {
                return 0x80 | n2;
            }
            case 10: {
                return 0x8000 | n2;
            }
            case 11: {
                return 0x8080 | n2;
            }
            case 12: {
                return 0x800000 | n2;
            }
            case 13: {
                return 0x800080 | n2;
            }
            case 14: {
                return 0x808000 | n2;
            }
            case 15: {
                return 0xC0C0C0 | n2;
            }
        }
        throw new IllegalArgumentException("Illegal color name: " + n);
    }

    public void drawPolyline(int[] nArray, int[] nArray2, int n) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        for (int i = 0; i < n - 1; ++i) {
            this.drawLine(nArray[i], nArray2[i], nArray[i + 1], nArray2[i + 1]);
        }
    }

    public void drawPolyline(int[] nArray, int[] nArray2, int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        for (int i = n; i < n + n2 - 1; ++i) {
            this.drawLine(nArray[i], nArray2[i], nArray[i + 1], nArray2[i + 1]);
        }
    }

    public void fillPolygon(int[] nArray, int[] nArray2, int n) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.fillPolygon(nArray, 0, nArray2, 0, n, 0xFF000000 | this.getColor());
    }

    public void fillPolygon(int[] nArray, int[] nArray2, int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.fillPolygon(nArray, n, nArray2, n, n2, 0xFF000000 | this.getColor());
    }

    public void drawPolygon(int[] nArray, int[] nArray2, int n) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.drawPolygon(nArray, 0, nArray2, 0, n, 0xFF000000 | this.getColor());
    }

    public void drawPolygon(int[] nArray, int[] nArray2, int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.drawPolygon(nArray, n, nArray2, n, n2, 0xFF000000 | this.getColor());
    }

    public void drawScaledImage(com.nttdocomo.ui.Image image, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        try {
            if (this.dojaflipMode != 0) {
                int[] nArray = this.adjustCoordinates(image.getCanvas().getWidth(), image.getCanvas().getHeight(), n5, n6, n3, n4, this.dojaflipMode);
                n5 = nArray[0];
                n6 = nArray[1];
                n7 = nArray[2];
                n8 = nArray[3];
                n3 = nArray[2];
                n4 = nArray[3];
            }
            n += this.translateX;
            n2 += this.translateY;
            int n9 = this.getClipX() + this.translateX < 0 ? 0 : this.getClipX() + this.translateX;
            int n10 = this.getClipY() + this.translateY < 0 ? 0 : this.getClipY() + this.translateY;
            int n11 = this.getClipWidth() + this.getClipX() + this.translateX > this.canvasWidth ? this.canvasWidth : this.getClipWidth() + this.getClipX() + this.translateX;
            int n12 = this.getClipHeight() + this.getClipY() + this.translateY > this.canvasHeight ? this.canvasHeight : this.getClipHeight() + this.getClipY() + this.translateY;
            BufferedImage bufferedImage = PlatformGraphics.manipulateImage(image.getCanvas(), this.dojaflipMode);
            int[] nArray = ((DataBufferInt)bufferedImage.getRaster().getDataBuffer()).getData();
            n7 = Math.min(n7, image.getWidth());
            n8 = Math.min(n8, image.getHeight());
            n3 = Math.min(n3, image.getWidth());
            n4 = Math.min(n4, image.getHeight());
            for (int i = n2; i < n2 + n4; ++i) {
                int n13 = n6 + (i - n2) * n8 / n4;
                for (int j = n; j < n + n3; ++j) {
                    int n14 = n5 + (j - n) * n7 / n3;
                    if (n14 < n5 || n14 >= n5 + n7 || n13 < n6 || n13 >= n6 + n8 || n13 * image.getWidth() + n14 < 0 || n13 * image.getWidth() + n14 >= nArray.length - 1 || i * this.canvasWidth + j < 0 || i * this.canvasWidth + j >= this.canvasData.length - 1 || j >= n11 || j < n9 || i >= n12 || i < n10) continue;
                    this.setPixel(j, i, this.blendPixels(nArray[n13 * image.getWidth() + n14], this.canvasData[i * this.canvasWidth + j]));
                }
            }
        }
        catch (Exception exception) {
            Mobile.log((byte)4, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawScaledImage: " + exception.getMessage());
        }
    }

    public void drawSpriteSet(SpriteSet spriteSet) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawSpriteSet is untested ");
        for (Sprite sprite : spriteSet.getSprites()) {
            this.drawRGB(sprite.getImage().getDataBuffer(), 0, sprite.getImage().getWidth(), sprite.getX(), sprite.getY(), sprite.getImage().getWidth(), sprite.getImage().getHeight(), true);
        }
    }

    public void drawImageMap(ImageMap imageMap, int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": drawImageMap is untested ");
        imageMap.setWindowLocation(n, n2);
        imageMap.draw((Graphics)this);
    }

    public void setFlipMode(int n) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        switch (n) {
            case 0: 
            case 1: 
            case 2: 
            case 3: 
            case 4: 
            case 5: 
            case 6: 
            case 7: {
                this.dojaflipMode = n;
                break;
            }
            default: {
                throw new IllegalArgumentException("Invalid flip mode received: " + n);
            }
        }
    }

    public int getPixel(int n, int n2) {
        return this.getRGBPixel(n, n2);
    }

    public int getRGBPixel(int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        return this.canvasData[n2 * this.canvasWidth + n];
    }

    public void setPixel(int n, int n2) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.canvasData[n2 * this.canvasWidth + n] = this.getColor();
    }

    public void setPixel(int n, int n2, int n3) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        int n4 = this.getColor();
        this.setAlphaRGB(n3);
        this.setPixel(n, n2);
        this.setAlphaRGB(n4);
    }

    public void setRGBPixel(int n, int n2, int n3) {
        this.setPixel(n, n2, n3);
    }

    public int[] getPixels(int n, int n2, int n3, int n4, int[] nArray, int n5) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        if (nArray == null) {
            throw new NullPointerException("Null data array received");
        }
        if (n3 < 0 || n4 < 0) {
            throw new IllegalArgumentException("Invalid value for width or height");
        }
        if (n5 < 0 || n5 + n3 * n4 > nArray.length || n5 + n3 * n4 < 0) {
            throw new ArrayIndexOutOfBoundsException("Requested range is out of bounds");
        }
        this.getPixels(nArray, n5, n3, n, n2, n3, n4, 8888);
        return nArray;
    }

    public void setPixels(int n, int n2, int n3, int n4, int[] nArray, int n5) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        if (nArray == null) {
            throw new NullPointerException("Null data array received");
        }
        if (n3 < 0 || n4 < 0) {
            throw new IllegalArgumentException("Invalid value for width or height");
        }
        if (n5 < 0 || n5 + n3 * n4 > nArray.length || n5 + n3 * n4 < 0) {
            throw new ArrayIndexOutOfBoundsException("Requested range is out of bounds");
        }
        this.drawRGB(nArray, n5, n3, n, n2, n3, n4, Mobile.DoJaVersion >= 40);
    }

    public void setRGBPixels(int n, int n2, int n3, int n4, int[] nArray, int n5) {
        this.setPixels(n, n2, n3, n4, nArray, n5);
    }

    public int[] getRGBPixels(int n, int n2, int n3, int n4, int[] nArray, int n5) {
        return this.getPixels(n, n2, n3, n4, nArray, n5);
    }

    public void setPictoColorEnabled(boolean bl) {
        if (this.contextDisposed) {
            throw new UIException(1, "This graphics context has been disposed");
        }
        this.usePictoColor = bl;
    }

    @Override
    public void drawCommandList(com.jblend.graphics.j3d.Texture texture, int n, int n2, FigureLayout figureLayout, com.jblend.graphics.j3d.Effect3D effect3D, int[] nArray) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.drawCommandList(texture, n, n2, figureLayout.getLayout(), effect3D.getEffect(), nArray);
    }

    @Override
    public void drawCommandList(com.jblend.graphics.j3d.Texture[] textureArray, int n, int n2, FigureLayout figureLayout, com.jblend.graphics.j3d.Effect3D effect3D, int[] nArray) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        com.mascotcapsule.micro3d.v3.Texture[] textureArray2 = new com.mascotcapsule.micro3d.v3.Texture[textureArray.length];
        for (int i = 0; i < textureArray.length; ++i) {
            textureArray2[i] = textureArray[i];
        }
        this.mcv3gc.drawCommandList(textureArray2, n, n2, figureLayout.getLayout(), effect3D.getEffect(), nArray);
    }

    @Override
    public void drawCommandList(com.motorola.graphics.j3d.Texture texture, int n, int n2, com.motorola.graphics.j3d.FigureLayout figureLayout, Effect3D effect3D, int[] nArray) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.drawCommandList(texture, n, n2, figureLayout.getLayout(), effect3D.getEffect(), nArray);
    }

    @Override
    public void drawCommandList(com.motorola.graphics.j3d.Texture[] textureArray, int n, int n2, com.motorola.graphics.j3d.FigureLayout figureLayout, Effect3D effect3D, int[] nArray) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        com.mascotcapsule.micro3d.v3.Texture[] textureArray2 = new com.mascotcapsule.micro3d.v3.Texture[textureArray.length];
        for (int i = 0; i < textureArray.length; ++i) {
            textureArray2[i] = textureArray[i];
        }
        this.mcv3gc.drawCommandList(textureArray2, n, n2, figureLayout.getLayout(), effect3D.getEffect(), nArray);
    }

    @Override
    public void drawCommandList(com.vodafone.v10.graphics.j3d.Texture texture, int n, int n2, com.vodafone.v10.graphics.j3d.FigureLayout figureLayout, com.vodafone.v10.graphics.j3d.Effect3D effect3D, int[] nArray) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.drawCommandList(texture, n, n2, figureLayout.getLayout(), effect3D.getEffect(), nArray);
    }

    @Override
    public void drawCommandList(com.vodafone.v10.graphics.j3d.Texture[] textureArray, int n, int n2, com.vodafone.v10.graphics.j3d.FigureLayout figureLayout, com.vodafone.v10.graphics.j3d.Effect3D effect3D, int[] nArray) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        com.mascotcapsule.micro3d.v3.Texture[] textureArray2 = new com.mascotcapsule.micro3d.v3.Texture[textureArray.length];
        for (int i = 0; i < textureArray.length; ++i) {
            textureArray2[i] = textureArray[i];
        }
        this.mcv3gc.drawCommandList(textureArray2, n, n2, figureLayout.getLayout(), effect3D.getEffect(), nArray);
    }

    @Override
    public void drawFigure(com.jblend.graphics.j3d.Figure figure, int n, int n2, FigureLayout figureLayout, com.jblend.graphics.j3d.Effect3D effect3D) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.drawFigure(figure.getFigure(), n, n2, figureLayout.getLayout(), effect3D.getEffect());
    }

    @Override
    public void drawFigure(com.motorola.graphics.j3d.Figure figure, int n, int n2, com.motorola.graphics.j3d.FigureLayout figureLayout, Effect3D effect3D) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.drawFigure(figure.getFigure(), n, n2, figureLayout.getLayout(), effect3D.getEffect());
    }

    @Override
    public void drawFigure(com.vodafone.v10.graphics.j3d.Figure figure, int n, int n2, com.vodafone.v10.graphics.j3d.FigureLayout figureLayout, com.vodafone.v10.graphics.j3d.Effect3D effect3D) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.drawFigure(figure.getFigure(), n, n2, figureLayout.getLayout(), effect3D.getEffect());
    }

    @Override
    public void flush() {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.flush();
    }

    @Override
    public void renderFigure(com.jblend.graphics.j3d.Figure figure, int n, int n2, FigureLayout figureLayout, com.jblend.graphics.j3d.Effect3D effect3D) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.renderFigure(figure.getFigure(), n, n2, figureLayout.getLayout(), effect3D.getEffect());
    }

    @Override
    public void renderFigure(com.motorola.graphics.j3d.Figure figure, int n, int n2, com.motorola.graphics.j3d.FigureLayout figureLayout, Effect3D effect3D) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.renderFigure(figure.getFigure(), n, n2, figureLayout.getLayout(), effect3D.getEffect());
    }

    @Override
    public void renderFigure(com.vodafone.v10.graphics.j3d.Figure figure, int n, int n2, com.vodafone.v10.graphics.j3d.FigureLayout figureLayout, com.vodafone.v10.graphics.j3d.Effect3D effect3D) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.renderFigure(figure.getFigure(), n, n2, figureLayout.getLayout(), effect3D.getEffect());
    }

    @Override
    public void renderPrimitives(com.jblend.graphics.j3d.Texture texture, int n, int n2, FigureLayout figureLayout, com.jblend.graphics.j3d.Effect3D effect3D, int n3, int n4, int[] nArray, int[] nArray2, int[] nArray3, int[] nArray4) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.renderPrimitives(texture, n, n2, figureLayout.getLayout(), effect3D.getEffect(), n3, n4, nArray, nArray2, nArray3, nArray4);
    }

    @Override
    public void renderPrimitives(com.motorola.graphics.j3d.Texture texture, int n, int n2, com.motorola.graphics.j3d.FigureLayout figureLayout, Effect3D effect3D, int n3, int n4, int[] nArray, int[] nArray2, int[] nArray3, int[] nArray4) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.renderPrimitives(texture, n, n2, figureLayout.getLayout(), effect3D.getEffect(), n3, n4, nArray, nArray2, nArray3, nArray4);
    }

    @Override
    public void renderPrimitives(com.vodafone.v10.graphics.j3d.Texture texture, int n, int n2, com.vodafone.v10.graphics.j3d.FigureLayout figureLayout, com.vodafone.v10.graphics.j3d.Effect3D effect3D, int n3, int n4, int[] nArray, int[] nArray2, int[] nArray3, int[] nArray4) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.renderPrimitives(texture, n, n2, figureLayout.getLayout(), effect3D.getEffect(), n3, n4, nArray, nArray2, nArray3, nArray4);
    }

    @Override
    public void drawFigure(Figure figure) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.drawFigure(figure.getFigure(), this.mcv3layout.getCenterX(), this.mcv3layout.getCenterY(), this.mcv3layout, this.mcv3effect);
    }

    @Override
    public void enableLight(boolean bl) {
        int n = this.mcv3commands.get(this.mcv3commands.size() - 1);
        if ((n & 0x83000000) == -2097152000) {
            n = bl ? (n = n | 1) : (n = n & 0xFFFFFFFE);
            this.mcv3commands.set(this.mcv3commands.size() - 1, n);
        } else {
            this.mcv3commands.add(bl ? -2097151999 : -2097152000);
        }
        this.mcv3effect.setLight(bl ? this.mcv3light : null);
    }

    @Override
    public void enableSemiTransparent(boolean bl) {
        int n = this.mcv3commands.get(this.mcv3commands.size() - 1);
        if ((n & 0x83000000) == -2097152000) {
            n = bl ? (n = n | 8) : (n = n & 0xFFFFFFF7);
            this.mcv3commands.set(this.mcv3commands.size() - 1, n);
        } else {
            this.mcv3commands.add(bl ? -2097151992 : -2097152000);
        }
        this.mcv3effect.setSemiTransparentEnabled(bl);
    }

    @Override
    public void enableSphereMap(boolean bl) {
        int n = this.mcv3commands.get(this.mcv3commands.size() - 1);
        if ((n & 0x83000000) == -2097152000) {
            n = bl ? (n = n | 2) : (n = n & 0xFFFFFFFD);
            this.mcv3commands.set(this.mcv3commands.size() - 1, n);
        } else {
            this.mcv3commands.add(bl ? -2097151998 : -2097152000);
        }
        this.mcv3effect.setSphereTexture(bl ? this.mcv3envMap : null);
    }

    @Override
    public void enableToonShader(boolean bl) {
        int n = this.mcv3commands.get(this.mcv3commands.size() - 1);
        if ((n & 0x83000000) == -2097152000) {
            n = bl ? (n = n | 4) : (n = n & 0xFFFFFFFB);
            this.mcv3commands.set(this.mcv3commands.size() - 1, n);
        } else {
            this.mcv3commands.add(bl ? -2097151996 : -2097152000);
        }
        this.mcv3effect.setShading(bl ? 1 : 0);
    }

    @Override
    public void executeCommandList(int[] nArray) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3commands.add(-2113929216);
        this.mcv3commands.add(Integer.MIN_VALUE);
        int[] nArray2 = new int[this.mcv3commands.size()];
        for (int i = 0; i < nArray2.length; ++i) {
            nArray2[i] = this.mcv3commands.get(i);
        }
        Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": DoJa executeCommandList");
        this.mcv3gc.drawCommandList(this.mcv3textures, 0, 0, this.mcv3layout, this.mcv3effect, nArray2);
        this.mcv3commands.clear();
        this.mcv3commands.add(-33554431);
    }

    @Override
    public void renderFigure(Figure figure) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": DoJa renderFigure");
        this.mcv3gc.renderFigure(figure.getFigure(), 0, 0, this.mcv3layout, this.mcv3effect);
    }

    @Override
    public void renderPrimitives(PrimitiveArray primitiveArray, int n) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3gc.renderPrimitives(this.mcv3textures == null ? null : this.mcv3textures[0], 0, 0, this.mcv3layout, this.mcv3effect, n | primitiveArray.getType() << 24, primitiveArray.size(), primitiveArray.getVertexArray(), primitiveArray.getNormalArray(), primitiveArray.getTextureCoordArray(), primitiveArray.getColorArray());
    }

    @Override
    public void renderPrimitives(PrimitiveArray primitiveArray, int n, int n2, int n3) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        Mobile.log((byte)3, PlatformGraphics.class.getPackage().getName() + "." + PlatformGraphics.class.getSimpleName() + ": DoJa renderPrimitives B");
        this.mcv3gc.renderPrimitives(this.mcv3textures[0], 0, 0, this.mcv3layout, this.mcv3effect, n3 | primitiveArray.getType() << 24, n2, primitiveArray.getVertexArray(), primitiveArray.getNormalArray(), primitiveArray.getTextureCoordArray(), primitiveArray.getColorArray());
    }

    @Override
    public void setAmbientLight(int n) {
        this.mcv3commands.add(-1610612736);
        this.mcv3commands.add(n);
        this.mcv3light.setAmbientIntensity(n);
    }

    @Override
    public void setClipRect3D(int n, int n2, int n3, int n4) {
        if (this.mcv3gc == null) {
            this.mcv3gc = new com.mascotcapsule.micro3d.v3.Graphics3D();
            this.mcv3gc.bind(this);
        }
        this.mcv3commands.add(-2080374784);
        this.mcv3commands.add(n);
        this.mcv3commands.add(n2);
        this.mcv3commands.add(n3);
        this.mcv3commands.add(n4);
        this.mcv3gc.release();
        int n5 = this.getClipX();
        int n6 = this.getClipY();
        int n7 = this.getClipWidth();
        int n8 = this.getClipHeight();
        this.setClip(n, n2, n3, n4);
        this.mcv3gc.bind(this);
        this.setClip(n5, n6, n7, n8);
    }

    @Override
    public void setDirectionLight(Vector3D vector3D, int n) {
        this.mcv3commands.add(-1593835520);
        this.mcv3commands.add(vector3D.getX());
        this.mcv3commands.add(vector3D.getY());
        this.mcv3commands.add(vector3D.getZ());
        this.mcv3commands.add(n);
        this.mcv3light.setParallelLightDirection(vector3D);
        this.mcv3light.setParallelLightIntensity(n);
    }

    @Override
    public void setPerspective(int n, int n2, int n3) {
        this.mcv3commands.add(-1845493760);
        this.mcv3commands.add(n);
        this.mcv3commands.add(n2);
        this.mcv3commands.add(n3);
        this.mcv3layout.setPerspective(n, n2, n3);
    }

    @Override
    public void setPerspective(int n, int n2, int n3, int n4) {
        this.mcv3commands.add(-1828716544);
        this.mcv3commands.add(n);
        this.mcv3commands.add(n2);
        this.mcv3commands.add(n3);
        this.mcv3commands.add(n4);
        this.mcv3layout.setPerspective(n, n2, n3, n4);
    }

    @Override
    public void setPrimitiveTexture(int n) {
        this.mcv3commands.add(0x86000000 | n);
    }

    @Override
    public void setPrimitiveTextureArray(Texture texture) {
        this.mcv3textures = new com.mascotcapsule.micro3d.v3.Texture[]{texture};
    }

    @Override
    public void setPrimitiveTextureArray(Texture[] textureArray) {
        this.mcv3textures = new com.mascotcapsule.micro3d.v3.Texture[textureArray.length];
        for (int i = 0; i < textureArray.length; ++i) {
            this.mcv3textures[i] = textureArray[i];
        }
    }

    @Override
    public void setScreenCenter(int n, int n2) {
        this.mcv3commands.add(-2063597568);
        this.mcv3commands.add(n);
        this.mcv3commands.add(n2);
        this.mcv3layout.setCenter(n, n2);
    }

    @Override
    public void setScreenScale(int n, int n2) {
        this.mcv3commands.add(-1879048192);
        this.mcv3commands.add(n);
        this.mcv3commands.add(n2);
    }

    @Override
    public void setScreenView(int n, int n2) {
        this.mcv3commands.add(-1862270976);
        this.mcv3commands.add(n);
        this.mcv3commands.add(n2);
        this.mcv3layout.setScale(n, n2);
    }

    @Override
    public void setSphereTexture(Texture texture) {
        this.mcv3envMap = texture;
        this.mcv3effect.setSphereTexture(texture);
    }

    @Override
    public void setToonParam(int n, int n2, int n3) {
        this.mcv3commands.add(-1358954496);
        this.mcv3commands.add(n);
        this.mcv3commands.add(n2);
        this.mcv3commands.add(n3);
        this.mcv3effect.setToonParams(n, n2, n3);
    }

    @Override
    public void setViewTrans(com.nttdocomo.opt.ui.j3d.AffineTrans affineTrans) {
        this.mcv3layout.setAffineTrans(affineTrans.getTrans());
    }

    @Override
    public void setViewTrans(int n) {
        this.mcv3commands.add(0x87000000 | n);
        this.mcv3layout.selectAffineTrans(n);
    }

    @Override
    public void setViewTransArray(com.nttdocomo.opt.ui.j3d.AffineTrans[] affineTransArray) {
        AffineTrans[] affineTransArray2 = new AffineTrans[affineTransArray.length];
        for (int i = 0; i < affineTransArray.length; ++i) {
            affineTransArray2[i] = affineTransArray[i].getTrans();
        }
        this.mcv3layout.setAffineTrans(affineTransArray2);
    }

    public final void showFPS() {
        ++frameCount;
        if (System.nanoTime() - lastFpsTime >= 1000000000L) {
            fps = frameCount;
            frameCount = 0;
            lastFpsTime = System.nanoTime();
        }
        String string = "FPS: " + fps;
        int n = this.getFont().stringWidth(string);
        int n2 = this.getFont().getBaselinePosition();
        if (MobilePlatform.showFPS.equals("TopLeft")) {
            this.setOrigin(2, 2);
        } else if (MobilePlatform.showFPS.equals("TopRight")) {
            this.setOrigin(MobilePlatform.lcdWidth - n - 2, 2);
        } else if (MobilePlatform.showFPS.equals("BottomLeft")) {
            this.setOrigin(2, MobilePlatform.lcdHeight - n2 - 2 - (MobilePlatform.focusCommandBar ? this.font.getHeight() : 0));
        } else if (MobilePlatform.showFPS.equals("BottomRight")) {
            this.setOrigin(MobilePlatform.lcdWidth - n - 2, MobilePlatform.lcdHeight - n2 - 2 - (MobilePlatform.focusCommandBar ? this.font.getHeight() : 0));
        }
        this.setARGBColor(-1778384791);
        this.fillRoundRect(0, 2, n, n2, 4, 4);
        this.setAlphaRGB(-20736);
        this.drawRoundRect(0, 2, n, n2, 4, 4);
        this.drawString(string, 0, 0, 20);
        this.setOrigin(0, 0);
        this.setColor(0, 0, 0);
    }

    public final void drawFastForwardIndicator() {
        int n = this.getColor();
        Font font = this.getFont();
        this.setAlphaRGB(-1879048192);
        this.gc.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.setFont(HUDFont);
        this.setColor(-20736);
        int n2 = (this.canvasWidth - HUDFont.stringWidth(fastForwardIndicator)) / 2;
        this.gc.drawString(fastForwardIndicator, n2, HUDFont.getHeight());
        this.setColor(n);
        this.setFont(font);
    }

    public final void drawPauseIndicator() {
        int n = this.getColor();
        Font font = this.getFont();
        this.setAlphaRGB(-1879048192);
        this.gc.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.setFont(HUDFont);
        this.setColor(-20736);
        int n2 = (this.canvasWidth - HUDFont.stringWidth(pauseIndicator)) / 2;
        this.gc.drawString(pauseIndicator, n2, HUDFont.getHeight());
        this.setColor(n);
        this.setFont(font);
    }

    protected static final int clamp(int n) {
        return Math.max(0, Math.min(255, n));
    }

    protected static final float fastToRadians(float f) {
        return f * ((float)Math.PI / 180);
    }
}

