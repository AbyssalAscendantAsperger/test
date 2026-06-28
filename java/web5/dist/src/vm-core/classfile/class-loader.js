"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassLoader = void 0;
const class_info_1 = require("./class-info");
class ClassLoader {
    constructor(classPath, systemClassPath) {
        this.classes = new Map();
        this.classPath = classPath;
        this.systemClassPath = systemClassPath;
    }
    loadClass(className) {
        if (this.classes.has(className)) {
            return this.classes.get(className);
        }
        if (className.startsWith("[")) {
            return this.loadArrayClass(className);
        }
        if (this.systemClassPath && this.systemClassPath.isSystemClass(className)) {
            const systemClass = this.systemClassPath.getSystemClass(className);
            if (systemClass) {
                systemClass.classLoader = this;
                this.classes.set(className, systemClass);
                if (systemClass.superClass) {
                    this.loadClass(systemClass.superClass);
                }
                for (const interfaceName of systemClass.interfaces) {
                    this.loadClass(interfaceName);
                }
                return systemClass;
            }
        }
        const data = this.classPath.readClass(className);
        if (!data) {
            throw new Error(`ClassNotFoundException: ${className}`);
        }
        const classInfo = new class_info_1.ClassInfo(data);
        classInfo.classLoader = this;
        if (classInfo.thisClass !== className) {
            throw new Error(`NoClassDefFoundError: Expected ${className}, found ${classInfo.thisClass}`);
        }
        this.classes.set(className, classInfo);
        if (classInfo.superClass) {
            this.loadClass(classInfo.superClass);
        }
        for (const interfaceName of classInfo.interfaces) {
            this.loadClass(interfaceName);
        }
        return classInfo;
    }
    loadArrayClass(className) {
        const classInfo = {
            thisClass: className,
            superClass: "java/lang/Object",
            interfaces: ["java/lang/Cloneable", "java/io/Serializable"],
            accessFlags: 0x0001,
            fields: [],
            methods: [],
            constantPool: { getSize: () => 0 },
            isPublic: () => true,
            isFinal: () => true,
            isInterface: () => false,
            isAbstract: () => false,
            getJavaVersion: () => "1.0",
            getInstanceFields: () => [],
            getStaticFields: () => [],
        };
        classInfo.classLoader = this;
        this.classes.set(className, classInfo);
        this.loadClass("java/lang/Object");
        return classInfo;
    }
    getClass(className) {
        return this.classes.get(className);
    }
}
exports.ClassLoader = ClassLoader;
//# sourceMappingURL=class-loader.js.map