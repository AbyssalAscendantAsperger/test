"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeRegistry = void 0;
class NativeRegistry {
    static register(className, methodName, descriptor, handler) {
        const key = this.getKey(className, methodName, descriptor);
        this.registry.set(key, handler);
    }
    static get(className, methodName, descriptor) {
        const key = this.getKey(className, methodName, descriptor);
        return this.registry.get(key);
    }
    static getKey(className, methodName, descriptor) {
        return `${className}.${methodName}${descriptor}`;
    }
}
exports.NativeRegistry = NativeRegistry;
NativeRegistry.registry = new Map();
//# sourceMappingURL=native-registry.js.map