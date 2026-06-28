export declare const CLASS_FILE_MAGIC = 3405691582;
export declare enum ConstantTag {
    Utf8 = 1,
    Integer = 3,
    Float = 4,
    Long = 5,
    Double = 6,
    Class = 7,
    String = 8,
    Fieldref = 9,
    Methodref = 10,
    InterfaceMethodref = 11,
    NameAndType = 12
}
export declare const CONSTANT_TAG_SIZE: Record<number, number>;
export declare enum AccessFlags {
    PUBLIC = 1,
    PRIVATE = 2,
    PROTECTED = 4,
    STATIC = 8,
    FINAL = 16,
    SYNCHRONIZED = 32,
    VOLATILE = 64,
    TRANSIENT = 128,
    NATIVE = 256,
    INTERFACE = 512,
    ABSTRACT = 1024,
    STRICT = 2048
}
export declare enum PrimitiveType {
    BYTE = "B",
    CHAR = "C",
    DOUBLE = "D",
    FLOAT = "F",
    INT = "I",
    LONG = "J",
    SHORT = "S",
    BOOLEAN = "Z",
    VOID = "V"
}
export declare const PRIMITIVE_SIZE: Record<string, number>;
export declare enum ExecutionStatus {
    RUNNING = 0,
    PAUSED = 1,
    BLOCKED = 2,
    WAITING = 3,
    TIMED_WAITING = 4,
    TERMINATED = 5
}
