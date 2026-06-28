"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaObject = void 0;
class JavaObject {
    static setClassLoader(loader) {
        JavaObject.classLoader = loader;
    }
    constructor(classInfo) {
        this.classObject = null;
        this.identityHash = null;
        this.classInfo = classInfo;
        this.fields = new Map();
        this.id = JavaObject.nextId++;
        this.initializeFields();
    }
    initializeFields() {
        if (typeof this.classInfo.getInstanceFields !== "function") {
            return;
        }
        if (this.classInfo.superClass && this.classInfo.superClass !== "java/lang/Object") {
            this.initializeSuperClassFields(this.classInfo.superClass);
        }
        for (const field of this.classInfo.getInstanceFields()) {
            const defaultValue = this.getDefaultValue(field);
            this.setField(field.name, field.descriptor, defaultValue);
        }
    }
    initializeSuperClassFields(superClassName) {
        if (superClassName === "java/lang/Object" || !JavaObject.classLoader) {
            return;
        }
        try {
            const superClassInfo = JavaObject.classLoader.loadClass(superClassName);
            if (superClassInfo.superClass && superClassInfo.superClass !== "java/lang/Object") {
                this.initializeSuperClassFields(superClassInfo.superClass);
            }
            if (typeof superClassInfo.getInstanceFields === "function") {
                for (const field of superClassInfo.getInstanceFields()) {
                    const defaultValue = this.getDefaultValue(field);
                    this.setField(field.name, field.descriptor, defaultValue);
                }
            }
        }
        catch (e) {
            console.warn(`Failed to initialize superclass fields for ${superClassName}:`, e);
        }
    }
    getDefaultValue(field) {
        switch (field.descriptor) {
            case "Z":
            case "B":
            case "C":
            case "S":
            case "I":
                return 0;
            case "J":
                return 0n;
            case "F":
            case "D":
                return 0.0;
            default:
                return null;
        }
    }
    getField(name, descriptor) {
        const key = this.makeFieldKey(name, descriptor);
        const value = this.fields.get(key);
        if (value === undefined) {
            throw new Error(`Field not found: ${this.classInfo.thisClass}.${name}:${descriptor}`);
        }
        return value;
    }
    setField(name, descriptor, value) {
        const key = this.makeFieldKey(name, descriptor);
        this.fields.set(key, value);
    }
    makeFieldKey(name, descriptor) {
        return `${name}:${descriptor}`;
    }
    instanceof(className) {
        if (this.classInfo.thisClass === className) {
            return true;
        }
        if (this.classInfo.superClass && JavaObject.classLoader) {
            if (this.isInstanceOfSuperClass(this.classInfo.superClass, className)) {
                return true;
            }
        }
        if (this.classInfo.interfaces.includes(className)) {
            return true;
        }
        return false;
    }
    isInstanceOfSuperClass(superClassName, targetClassName) {
        if (superClassName === targetClassName) {
            return true;
        }
        if (superClassName === "java/lang/Object" || !JavaObject.classLoader) {
            return false;
        }
        try {
            const superClassInfo = JavaObject.classLoader.loadClass(superClassName);
            if (superClassInfo.superClass) {
                return this.isInstanceOfSuperClass(superClassInfo.superClass, targetClassName);
            }
        }
        catch (e) {
            console.warn(`Failed to check instanceof for superclass ${superClassName}:`, e);
        }
        return false;
    }
    getClassName() {
        return this.classInfo.thisClass;
    }
    toString() {
        return `${this.classInfo.thisClass}@${this.id}`;
    }
    printFields() {
        const lines = [];
        lines.push(`Object: ${this.toString()}`);
        for (const [key, value] of this.fields.entries()) {
            let valueStr;
            if (value === null) {
                valueStr = "null";
            }
            else if (typeof value === "bigint") {
                valueStr = `${value}n`;
            }
            else if (typeof value === "object") {
                valueStr = value.toString?.() || "[object]";
            }
            else {
                valueStr = String(value);
            }
            lines.push(`  ${key} = ${valueStr}`);
        }
        return lines.join("\n");
    }
    getClassObject() {
        if (!this.classObject) {
            this.classObject = { classInfo: this.classInfo };
        }
        return this.classObject;
    }
    setClassObject(classObject) {
        this.classObject = classObject;
    }
    getIdentityHashCode() {
        if (this.identityHash === null) {
            this.identityHash = this.id;
        }
        return this.identityHash;
    }
}
exports.JavaObject = JavaObject;
JavaObject.nextId = 0;
JavaObject.classLoader = null;
//# sourceMappingURL=object.js.map