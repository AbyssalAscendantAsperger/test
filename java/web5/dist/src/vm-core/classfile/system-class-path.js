"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemClassPath = void 0;
const method_info_1 = require("./method-info");
class SystemClassPath {
    constructor() {
        this.systemClasses = new Map();
        this.initializeSystemClasses();
    }
    initializeSystemClasses() {
        this.createSystemClass("java/lang/Object", null, [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "hashCode", descriptor: "()I", accessFlags: 0x0001 },
                { name: "getClass", descriptor: "()Ljava/lang/Class;", accessFlags: 0x0011 },
                { name: "clone", descriptor: "()Ljava/lang/Object;", accessFlags: 0x0004 },
                { name: "notify", descriptor: "()V", accessFlags: 0x0011 },
                { name: "notifyAll", descriptor: "()V", accessFlags: 0x0011 },
                { name: "wait", descriptor: "(J)V", accessFlags: 0x0011 },
            ]
        });
        this.createSystemClass("java/lang/String", "java/lang/Object", ["java/io/Serializable", "java/lang/Comparable", "java/lang/CharSequence"], {
            fields: [
                { name: "value", descriptor: "[C", accessFlags: 0x0002 },
                { name: "offset", descriptor: "I", accessFlags: 0x0002 },
                { name: "count", descriptor: "I", accessFlags: 0x0002 },
            ],
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "([C)V", accessFlags: 0x0001 },
                { name: "charAt", descriptor: "(I)C", accessFlags: 0x0001 },
                { name: "length", descriptor: "()I", accessFlags: 0x0001 },
                { name: "substring", descriptor: "(II)Ljava/lang/String;", accessFlags: 0x0001 },
                { name: "toString", descriptor: "()Ljava/lang/String;", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/Class", "java/lang/Object", ["java/io/Serializable"], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0000 },
                { name: "getName", descriptor: "()Ljava/lang/String;", accessFlags: 0x0001 },
                { name: "getSuperclass", descriptor: "()Ljava/lang/Class;", accessFlags: 0x0001 },
                { name: "isInterface", descriptor: "()Z", accessFlags: 0x0001 },
                { name: "isArray", descriptor: "()Z", accessFlags: 0x0001 },
                { name: "getComponentType", descriptor: "()Ljava/lang/Class;", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("javax/microedition/midlet/MIDlet", "java/lang/Object", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "startApp", descriptor: "()V", accessFlags: 0x0001 },
                { name: "pauseApp", descriptor: "()V", accessFlags: 0x0001 },
                { name: "destroyApp", descriptor: "(Z)V", accessFlags: 0x0001 },
                { name: "notifyDestroyed", descriptor: "()V", accessFlags: 0x0011 },
                { name: "notifyPaused", descriptor: "()V", accessFlags: 0x0011 },
                { name: "resumeRequest", descriptor: "()V", accessFlags: 0x0011 },
                { name: "getAppProperty", descriptor: "(Ljava/lang/String;)Ljava/lang/String;", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/io/InputStream", "java/lang/Object", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "read", descriptor: "()I", accessFlags: 0x0001 },
                { name: "read", descriptor: "([B)I", accessFlags: 0x0001 },
                { name: "read", descriptor: "([BII)I", accessFlags: 0x0001 },
                { name: "skip", descriptor: "(J)J", accessFlags: 0x0001 },
                { name: "available", descriptor: "()I", accessFlags: 0x0001 },
                { name: "close", descriptor: "()V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/io/ByteArrayInputStream", "java/io/InputStream", [], {
            fields: [
                { name: "buf", descriptor: "[B", accessFlags: 0x0002 },
                { name: "pos", descriptor: "I", accessFlags: 0x0002 },
                { name: "count", descriptor: "I", accessFlags: 0x0002 },
            ],
            methods: [
                { name: "<init>", descriptor: "([B)V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "([BII)V", accessFlags: 0x0001 },
                { name: "read", descriptor: "()I", accessFlags: 0x0001 },
                { name: "read", descriptor: "([BII)I", accessFlags: 0x0001 },
                { name: "skip", descriptor: "(J)J", accessFlags: 0x0001 },
                { name: "available", descriptor: "()I", accessFlags: 0x0001 },
                { name: "reset", descriptor: "()V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/System", "java/lang/Object", [], {
            fields: [
                { name: "out", descriptor: "Ljava/io/PrintStream;", accessFlags: 0x0019 },
                { name: "err", descriptor: "Ljava/io/PrintStream;", accessFlags: 0x0019 },
                { name: "in", descriptor: "Ljava/io/InputStream;", accessFlags: 0x0019 },
            ],
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0000 },
                { name: "currentTimeMillis", descriptor: "()J", accessFlags: 0x0008 },
                { name: "arraycopy", descriptor: "(Ljava/lang/Object;ILjava/lang/Object;II)V", accessFlags: 0x0008 },
                { name: "getProperty", descriptor: "(Ljava/lang/String;)Ljava/lang/String;", accessFlags: 0x0008 },
            ]
        });
        this.createSystemClass("java/lang/Throwable", "java/lang/Object", ["java/io/Serializable"], {
            fields: [
                { name: "detailMessage", descriptor: "Ljava/lang/String;", accessFlags: 0x0002 },
            ],
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
                { name: "getMessage", descriptor: "()Ljava/lang/String;", accessFlags: 0x0001 },
                { name: "toString", descriptor: "()Ljava/lang/String;", accessFlags: 0x0001 },
                { name: "printStackTrace", descriptor: "()V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/Exception", "java/lang/Throwable", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/RuntimeException", "java/lang/Exception", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/NullPointerException", "java/lang/RuntimeException", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/ArrayIndexOutOfBoundsException", "java/lang/RuntimeException", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/ClassCastException", "java/lang/RuntimeException", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/ArithmeticException", "java/lang/RuntimeException", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/IllegalMonitorStateException", "java/lang/RuntimeException", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/Runnable", null, [], {
            methods: [
                { name: "run", descriptor: "()V", accessFlags: 0x0401 },
            ]
        });
        this.createSystemClass("java/util/Random", "java/lang/Object", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(J)V", accessFlags: 0x0001 },
                { name: "nextInt", descriptor: "()I", accessFlags: 0x0001 },
                { name: "nextInt", descriptor: "(I)I", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/Runtime", "java/lang/Object", [], {
            methods: [
                { name: "getRuntime", descriptor: "()Ljava/lang/Runtime;", accessFlags: 0x0009 },
                { name: "gc", descriptor: "()V", accessFlags: 0x0001 },
                { name: "freeMemory", descriptor: "()J", accessFlags: 0x0001 },
                { name: "totalMemory", descriptor: "()J", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("java/lang/StringBuffer", "java/lang/Object", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "<init>", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
                { name: "append", descriptor: "(Ljava/lang/String;)Ljava/lang/StringBuffer;", accessFlags: 0x0001 },
                { name: "append", descriptor: "(I)Ljava/lang/StringBuffer;", accessFlags: 0x0001 },
                { name: "append", descriptor: "(C)Ljava/lang/StringBuffer;", accessFlags: 0x0001 },
                { name: "append", descriptor: "(Z)Ljava/lang/StringBuffer;", accessFlags: 0x0001 },
                { name: "toString", descriptor: "()Ljava/lang/String;", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("javax/microedition/lcdui/Displayable", "java/lang/Object", [], {
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "isShown", descriptor: "()Z", accessFlags: 0x0001 },
                { name: "setTitle", descriptor: "(Ljava/lang/String;)V", accessFlags: 0x0001 },
                { name: "getTitle", descriptor: "()Ljava/lang/String;", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("javax/microedition/lcdui/Canvas", "javax/microedition/lcdui/Displayable", [], {
            fields: [
                { name: "UP", descriptor: "I", accessFlags: 0x0019 },
                { name: "DOWN", descriptor: "I", accessFlags: 0x0019 },
                { name: "LEFT", descriptor: "I", accessFlags: 0x0019 },
                { name: "RIGHT", descriptor: "I", accessFlags: 0x0019 },
                { name: "FIRE", descriptor: "I", accessFlags: 0x0019 },
                { name: "GAME_A", descriptor: "I", accessFlags: 0x0019 },
                { name: "GAME_B", descriptor: "I", accessFlags: 0x0019 },
                { name: "GAME_C", descriptor: "I", accessFlags: 0x0019 },
                { name: "GAME_D", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM0", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM1", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM2", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM3", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM4", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM5", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM6", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM7", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM8", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_NUM9", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_STAR", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_POUND", descriptor: "I", accessFlags: 0x0019 },
            ],
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
                { name: "isDoubleBuffered", descriptor: "()Z", accessFlags: 0x0001 },
                { name: "hasPointerEvents", descriptor: "()Z", accessFlags: 0x0001 },
                { name: "hasPointerMotionEvents", descriptor: "()Z", accessFlags: 0x0001 },
                { name: "hasRepeatEvents", descriptor: "()Z", accessFlags: 0x0001 },
                { name: "getKeyName", descriptor: "(I)Ljava/lang/String;", accessFlags: 0x0001 },
                { name: "getGameAction", descriptor: "(I)I", accessFlags: 0x0001 },
                { name: "getKeyCode", descriptor: "(I)I", accessFlags: 0x0001 },
                { name: "repaint", descriptor: "()V", accessFlags: 0x0001 },
                { name: "repaint", descriptor: "(IIII)V", accessFlags: 0x0001 },
                { name: "serviceRepaints", descriptor: "()V", accessFlags: 0x0001 },
                { name: "getWidth", descriptor: "()I", accessFlags: 0x0001 },
                { name: "getHeight", descriptor: "()I", accessFlags: 0x0001 },
            ]
        });
        this.createSystemClass("com/nokia/mid/ui/FullCanvas", "javax/microedition/lcdui/Canvas", [], {
            fields: [
                { name: "KEY_SOFTKEY1", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_SOFTKEY2", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_SEND", descriptor: "I", accessFlags: 0x0019 },
                { name: "KEY_END", descriptor: "I", accessFlags: 0x0019 },
            ],
            methods: [
                { name: "<init>", descriptor: "()V", accessFlags: 0x0001 },
            ]
        });
    }
    createSystemClass(className, superClass, interfaces = [], members = {}) {
        const methodsObj = (members.methods || []).map((m) => {
            const methodInstance = {
                accessFlags: m.accessFlags,
                name: m.name,
                descriptor: m.descriptor,
                attributes: [],
                classInfo: null
            };
            Object.setPrototypeOf(methodInstance, method_info_1.MethodInfo.prototype);
            return methodInstance;
        });
        const classInfo = {
            thisClass: className,
            superClass: superClass,
            interfaces: interfaces,
            accessFlags: 0x0001,
            fields: members.fields || [],
            methods: methodsObj,
            constantPool: {
                getSize: () => 0,
                resolve: () => { throw new Error("System class constant pool not implemented"); }
            },
            isPublic: () => true,
            isFinal: () => false,
            isInterface: () => false,
            isAbstract: () => false,
            isStatic: () => false,
            getJavaVersion: () => "1.1",
            getInstanceFields: function () {
                return this.fields.filter((f) => (f.accessFlags & 0x0008) === 0);
            },
            getStaticFields: function () {
                return this.fields.filter((f) => (f.accessFlags & 0x0008) !== 0);
            },
            getMethod: function (name, descriptor) {
                return this.methods.find((m) => m.name === name && m.descriptor === descriptor) || null;
            },
            getField: function (name, descriptor) {
                return this.fields.find((f) => f.name === name && f.descriptor === descriptor) || null;
            }
        };
        methodsObj.forEach((m) => {
            m.classInfo = classInfo;
        });
        this.systemClasses.set(className, classInfo);
    }
    readClass(className) {
        return null;
    }
    getSystemClass(className) {
        return this.systemClasses.get(className);
    }
    isSystemClass(className) {
        return this.systemClasses.has(className);
    }
    getAllSystemClassNames() {
        return Array.from(this.systemClasses.keys());
    }
}
exports.SystemClassPath = SystemClassPath;
//# sourceMappingURL=system-class-path.js.map