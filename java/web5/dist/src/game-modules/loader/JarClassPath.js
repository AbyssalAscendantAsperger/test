"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JarClassPath = void 0;
class JarClassPath {
    constructor(loader) {
        this.loader = loader;
    }
    readClass(className) {
        let path = className;
        if (path.endsWith('.class')) {
            path = path.substring(0, path.length - 6);
        }
        path = path + '.class';
        return this.loader.getFile(path);
    }
}
exports.JarClassPath = JarClassPath;
//# sourceMappingURL=JarClassPath.js.map