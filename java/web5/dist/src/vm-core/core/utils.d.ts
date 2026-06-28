export declare function isPublic(flags: number): boolean;
export declare function isPrivate(flags: number): boolean;
export declare function isProtected(flags: number): boolean;
export declare function isStatic(flags: number): boolean;
export declare function isFinal(flags: number): boolean;
export declare function isNative(flags: number): boolean;
export declare function isAbstract(flags: number): boolean;
export declare function isInterface(flags: number): boolean;
export declare function internalNameToDotted(internalName: string): string;
export declare function dottedNameToInternal(dottedName: string): string;
export declare function parseMethodDescriptor(descriptor: string): {
    params: string[];
    returnType: string;
};
export declare function makeDenseArray<T>(size: number, defaultValue: T): T[];
export declare function bytesToHex(bytes: Uint8Array, maxLength?: number): string;
