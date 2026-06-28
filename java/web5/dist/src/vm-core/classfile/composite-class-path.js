"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeClassPath = void 0;
class CompositeClassPath {
    constructor(...classPaths) {
        this.classPaths = [];
        this.classPaths = [...classPaths];
    }
    addClassPath(classPath) {
        this.classPaths.push(classPath);
    }
    insertClassPath(index, classPath) {
        if (index < 0 || index > this.classPaths.length) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        this.classPaths.splice(index, 0, classPath);
    }
    removeClassPath(classPath) {
        const index = this.classPaths.indexOf(classPath);
        if (index >= 0) {
            this.classPaths.splice(index, 1);
            return true;
        }
        return false;
    }
    getClassPathCount() {
        return this.classPaths.length;
    }
    readClass(className) {
        for (const classPath of this.classPaths) {
            const data = classPath.readClass(className);
            if (data !== null) {
                return data;
            }
        }
        return null;
    }
    clear() {
        this.classPaths = [];
    }
}
exports.CompositeClassPath = CompositeClassPath;
//# sourceMappingURL=composite-class-path.js.map