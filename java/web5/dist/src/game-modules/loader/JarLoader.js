"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JarLoader = void 0;
const jszip_1 = __importDefault(require("jszip"));
const Image_1 = require("../graphics/Image");
class JarLoader {
    constructor() {
        this.files = new Map();
        this.loaded = false;
    }
    async loadJar(data) {
        try {
            const zip = await jszip_1.default.loadAsync(data);
            const promises = [];
            zip.forEach((relativePath, file) => {
                if (!file.dir) {
                    const promise = file.async('uint8array').then(content => {
                        const normalizedPath = this.normalizePath(relativePath);
                        this.files.set(normalizedPath, content);
                    });
                    promises.push(promise);
                }
            });
            await Promise.all(promises);
            this.loaded = true;
            console.log(`JAR loaded: ${this.files.size} files extracted.`);
        }
        catch (e) {
            console.error("Failed to load JAR:", e);
            throw e;
        }
    }
    getFile(path) {
        if (!this.loaded) {
            console.warn("JarLoader not loaded yet.");
            return null;
        }
        const normalizedPath = this.normalizePath(path);
        return this.files.get(normalizedPath) || null;
    }
    fileExists(path) {
        const normalizedPath = this.normalizePath(path);
        return this.files.has(normalizedPath);
    }
    loadImage(path) {
        const data = this.getFile(path);
        if (!data) {
            return null;
        }
        if (typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
            const blob = new Blob([data], { type: this.getMimeType(path) });
            const url = URL.createObjectURL(blob);
            return Image_1.Image.createImageFromPath(url);
        }
        else {
            console.warn("Blob/URL not supported in this environment.");
            return Image_1.Image.createImage(100, 100);
        }
    }
    normalizePath(path) {
        let p = path.replace(/\\/g, '/');
        if (p.startsWith('/')) {
            p = p.substring(1);
        }
        return p;
    }
    getMimeType(path) {
        if (path.endsWith('.png'))
            return 'image/png';
        if (path.endsWith('.jpg') || path.endsWith('.jpeg'))
            return 'image/jpeg';
        if (path.endsWith('.gif'))
            return 'image/gif';
        return 'application/octet-stream';
    }
}
exports.JarLoader = JarLoader;
//# sourceMappingURL=JarLoader.js.map