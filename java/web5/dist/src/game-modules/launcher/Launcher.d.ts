export interface GameConfig {
    jarUrl?: string;
    jarData?: ArrayBuffer;
    mainClass?: string;
    screenSize?: string;
}
export declare class Launcher {
    private config;
    private loader;
    constructor(config: GameConfig);
    load(): Promise<void>;
    getMainClassName(): string | null;
    start(): void;
}
