"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStdlib = void 0;
const java_lang_1 = require("./java.lang");
const Class_1 = require("./java.lang/Class");
const MIDlet_1 = require("./javax.microedition/midlet/MIDlet");
function initStdlib() {
    (0, java_lang_1.registerObjectNatives)();
    (0, Class_1.registerClassNatives)();
    (0, java_lang_1.registerSystemNatives)();
    (0, MIDlet_1.registerMIDletNatives)();
}
exports.initStdlib = initStdlib;
//# sourceMappingURL=index.js.map