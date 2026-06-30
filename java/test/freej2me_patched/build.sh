#!/bin/bash
set -e

echo "=== Building FreeJ2ME (Java 8 Mode / Major Version 52) ==="
rm -rf build/classes
mkdir -p build/classes

find src -name "*.java" > sources.txt

JAVAC=$(which javac 2>/dev/null || find /usr -name javac 2>/dev/null | head -n 1 || echo "javac")
JAR=$(which jar 2>/dev/null || find /usr -name jar 2>/dev/null | head -n 1 || echo "jar")

# Existing web jar is used as a compatibility base because this source tree does
# not contain every legacy class source (notably javax.microedition.rms), while
# the shipped freej2me.jar already contains those compiled classes.
BASE_JAR="${BASE_FREEJ2ME_JAR:-../assets_test/web5/app/freej2me.jar}"
if [ ! -f "$BASE_JAR" ]; then
    BASE_JAR="${BASE_FREEJ2ME_JAR:-}"
fi

# Detect Java version
JAVA_VER=$("$JAVAC" -version 2>&1 | awk '{print $2}' | awk -F '.' '{print $1}')

JAVAC_FLAGS="-encoding utf-8"
if [ -n "$JAVA_VER" ] && [ "$JAVA_VER" -ge 9 ] 2>/dev/null; then
    JAVAC_FLAGS="$JAVAC_FLAGS --release 8"
else
    JAVAC_FLAGS="$JAVAC_FLAGS -source 1.8 -target 1.8"
fi

CP_ARGS=""
if [ -n "$BASE_JAR" ] && [ -f "$BASE_JAR" ]; then
    CP_ARGS="-cp $BASE_JAR"
    echo "Using compatibility base jar: $BASE_JAR"
else
    echo "WARNING: compatibility base jar not found; full build may fail if source tree misses legacy classes."
fi

echo "Compiling Java sources using $JAVAC (Flags: $JAVAC_FLAGS $CP_ARGS)..."
# shellcheck disable=SC2086
"$JAVAC" $JAVAC_FLAGS $CP_ARGS -d build/classes @sources.txt

echo "Packaging freej2me.jar using $JAR..."
cat << 'MANIFEST' > manifest.tmp
Manifest-Version: 1.0
Main-Class: org.recompile.freej2me.FreeJ2ME
Implementation-Title: FreeJ2ME

MANIFEST

if [ -n "$BASE_JAR" ] && [ -f "$BASE_JAR" ]; then
    cp "$BASE_JAR" build/freej2me.jar
    "$JAR" uf build/freej2me.jar -C build/classes .
else
    "$JAR" cfm build/freej2me.jar manifest.tmp -C build/classes .
fi

if [ -d resources ]; then
    "$JAR" uf build/freej2me.jar -C resources .
fi
if [ -d META-INF ]; then
    "$JAR" uf build/freej2me.jar META-INF
fi

rm -f sources.txt manifest.tmp
echo "Build successful: build/freej2me.jar (Java 8 bytecode compatible)"
