import { RequestCallBackFunction } from "./Types";
export declare class CallbackRegistry {
    private static _instance;
    private callbacks;
    private constructor();
    static getInstance(): CallbackRegistry;
    addRegisterCallback(id: string, fn: RequestCallBackFunction): void;
    getCallbackById(id: string): RequestCallBackFunction;
}
