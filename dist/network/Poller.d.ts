export declare type serverAvailable = () => void;
export declare class Poller {
    private static _instance;
    private static INTERVAL_DEFAULT;
    private static URL_CALL;
    private interval;
    private isPollingBool;
    private constructor();
    static getInstance(): Poller;
    startPolling(callback: serverAvailable, delay?: number): void;
    isPolling(): boolean;
    stopPolling(): void;
}
