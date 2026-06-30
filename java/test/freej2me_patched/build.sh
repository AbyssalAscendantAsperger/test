#!/bin/bash
set -e

echo "=== Building FreeJ2ME (Java 8 Mode / Major Version 52) ==="
mkdir -p build/classes

find src -name "*.java" > sources.txt

JAVAC=$(which javac 2>/dev/null || find /usr -name javac 2>/dev/null | head -n 1 || echo "javac")
JAR=$(which jar 2>/dev/null || find /usr -name jar 2>/dev/null | head -n 1 || echo "jar")

# Detect Java version
JAVA_VER=$("$JAVAC" -version 2>&1 | awk '{print $2}' | awk -F '.' '{print $1}')

JAVAC_FLAGS="-encoding utf-8"
if [ -n "$JAVA_VER" ] && [ "$JAVA_VER" -ge 9 ] 2>/dev/null; then
    JAVAC_FLAGS="$JAVAC_FLAGS --release 8"
else
    JAVAC_FLAGS="$JAVAC_FLAGS -source 1.8 -target 1.8"
fi

echo "Compiling Java sources using $JAVAC (Flags: $JAVAC_FLAGS)..."
"$JAVAC" $JAVAC_FLAGS -d build/classes @sources.txt

echo "Packaging freej2me.jar using $JAR..."
cat << 'MANIFEST' > manifest.tmp
Manifest-Version: 1.0
Main-Class: org.recompile.freej2me.FreeJ2ME
Implementation-Title: FreeJ2ME

MANIFEST

"$JAR" cfm build/freej2me.jar manifest.tmp -C build/classes .
if [ -d resources ]; then
    "$JAR" uf build/freej2me.jar -C resources .
fi
if [ -d META-INF ]; then
    "$JAR" uf build/freej2me.jar META-INF
fi

rm -f sources.txt manifest.tmp
echo "Build successful: build/freej2me.jar (Java 8 bytecode compatible)"
