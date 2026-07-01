# --debugmodefreej2me Flag Documentation

## Overview
The `--debugmodefreej2me` flag is a master debug toggle for FreeJ2ME-Plus.
When **enabled**, all `Mobile.dlog()` calls produce diagnostic output.
When **disabled** (default), ALL `dlog()` calls are complete no-ops with zero runtime overhead.

## How It Works

### Core Mechanism
```java
// In Mobile.java
public static volatile boolean debugMode = false;

public static final void dlog(String tag, String msg) {
    if (!debugMode) return;  // Zero overhead when flag is absent
    log(LOG_DEBUG, "[DEBUG:" + tag + "] " + msg);
}

public static final void dlog(String tag, Object... parts) {
    if (!debugMode) return;  // Zero overhead when flag is absent
    // ... builds message and logs
}
```

### Usage

#### Desktop (AWT) Mode
Pass `--debugmodefreej2me` as a command-line argument:
```bash
java -jar freej2me.jar mygame.jar 1 240 320 --debugmodefreej2me
```

#### Web (CheerpJ) Mode
Add `debugmodefreej2me=1` as a URL parameter:
```
http://localhost:3015/cheerpj_run.html?token=mygame&width=240&height=320&debugmodefreej2me=1
```

## Debug Coverage by Subsystem

### Boot & Initialization (`Boot`)
- Debug mode activation confirmation
- Web mode detection
- Platform setup completion

### MIDlet Loading (`MIDletLoader`)
- Constructor entry with JAR URL
- Suitename resolution
- Jar entries count after loading
- start() entry with multi-midlet detection
- Auto-select mode for web
- Individual MIDlet start attempts (name + class)
- Class loading and instrumentation
- startApp invocation and success/failure
- Manifest parsing with property details
- Resource loading (success and failure paths)
- DoJa detection and JAM parsing
- Platform override checks

### Display System (`Display`)
- setCurrent calls with class names and sizes
- Alert + next displayable transitions
- showNotify/hideNotify calls per Canvas
- Canvas drawing wait logic and timeouts
- Immediate repaint mode behavior
- Event queue processing

### Canvas (`Canvas`)
- Constructor calls with dimensions and suppressKeys state
- repaint calls with coordinates and skip reasons
- repaintRequest entry with clip area
- serviceRepaints entry with pending state
- showNotify/hideNotify per subclass
- setFullScreenMode transitions
- Pointer events (pressed/released/dragged)
- Key events (pressed/released/repeated)

### Mobile Platform (`MobilePlatform`)
- keyPressed events with key codes
- keyReleased events
- keyRepeated events
- Pointer events
- flushGraphics entry
- JAR loading and manifest parsing

### Graphics (`Graphics`/`PlatformGraphics`)
- reset() calls with clip area and translation state
- drawImage calls with image dimensions and position
- drawRGB calls (when debugMode is on)
- flushGraphics entry and mode selection

### Configuration (`Config`)
- Setting changes with key and value
- Input mapping updates

## Adding New Debug Calls

Use the `dlog()` methods in any source file:

```java
// Simple string message
Mobile.dlog("Tag", "Something happened");

// Multiple parts (concatenated, no allocation when disabled)
Mobile.dlog("Tag", "Value=", someVar, " count=", count);
```

### Tag Conventions
| Tag | Subsystem |
|-----|-----------|
| `Boot` | Application startup |
| `MIDletLoader` | Game loading and class instrumentation |
| `Display` | Display management and setCurrent |
| `Canvas` | Canvas lifecycle, painting, events |
| `Graphics` | Rendering operations |
| `MobilePlatform` | Platform-level operations |
| `Config` | Configuration changes |
| `Audio` | Sound and music playback |
| `M3G` | 3D rendering |
| `MCV3` | MascotCapsule V3 3D rendering |

## Important Notes

1. **Zero overhead when disabled**: The `if (!debugMode) return;` check is the first line in every `dlog()` method. When the flag is not set, the JVM's JIT compiler will typically inline and eliminate these calls entirely.

2. **Existing `Mobile.log()` calls are unaffected**: The original logging system (controlled by `minLogLevel` / `logLevel` setting) continues to work independently. `dlog()` is an additional layer that only activates with `--debugmodefreej2me`.

3. **Web console output**: In CheerpJ/web mode, `dlog()` output appears in the browser's console via the existing log relay mechanism.

4. **File logging**: When debugMode is enabled and the file logger is active, debug messages are also written to `FreeJ2ME.log`.
