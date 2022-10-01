export declare enum RequestType {
    POST = 0,
    GET = 1,
    PUT = 2,
    DELETE = 3
}
export declare enum queueType {
    PRIORITY = 0,
    BACKGROUND = 1
}
export declare type JSONRequest = {
    url: string;
    type: RequestType;
    params: any;
    callbackId: string;
    associatedStateName: string;
    _id?: string;
    jwt?: any;
    context?: any;
};
export declare type ManagerRequest = {
    originalRequest: JSONRequest;
    callback: ManagerCallbackFunction;
    requestId: string;
    queueType: queueType;
    wasOffline: boolean;
};
export declare type SimpleRequest = {
    url: string;
    body: any;
    jwt?: any;
    callback: CallbackFunction;
    context?: any;
    params?: any[];
};
export declare type CallbackFunction = (data: any, status: number, context?: any) => void;
export declare type ManagerCallbackFunction = (data: any, status: number, queueId: number, requestId: string) => void;
export declare type RequestCallBackFunction = (data: any, status: number, associatedStateName: string, wasOffline?: boolean) => void;
