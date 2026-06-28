"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMIDletNatives = void 0;
const native_registry_1 = require("../../../../vm-core/native/native-registry");
function registerMIDletNatives() {
    const className = "javax/microedition/midlet/MIDlet";
    native_registry_1.NativeRegistry.register(className, "notifyDestroyed", "()V", (frame, thread) => {
        console.log("MIDlet: notifyDestroyed() called");
    });
    native_registry_1.NativeRegistry.register(className, "notifyPaused", "()V", (frame, thread) => {
        console.log("MIDlet: notifyPaused() called");
    });
    native_registry_1.NativeRegistry.register(className, "resumeRequest", "()V", (frame, thread) => {
        console.log("MIDlet: resumeRequest() called");
    });
    native_registry_1.NativeRegistry.register(className, "getAppProperty", "(Ljava/lang/String;)Ljava/lang/String;", (frame, thread) => {
        const keyObj = frame.getLocal(1);
        frame.stack.push(null);
    });
}
exports.registerMIDletNatives = registerMIDletNatives;
//# sourceMappingURL=MIDlet.js.map