"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const JarLoader_1 = require("../loader/JarLoader");
class Context {
    constructor() {
        this.jarLoader = new JarLoader_1.JarLoader();
    }
    static getInstance() {
        if (!Context.instance) {
            Context.instance = new Context();
        }
        return Context.instance;
    }
    getJarLoader() {
        return this.jarLoader;
    }
    setJarLoader(loader) {
        this.jarLoader = loader;
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map