export enum RequestType {
    POST,
    GET,
    PUT,
    DELETE,
    PATCH
}

export enum queueType {
    PRIORITY,
    BACKGROUND
}


export type JSONRequest = {
    url: string,
    type: RequestType,
    params: any,
    callbackId: string,
    associatedStateName: string,
    _id?: string,
    jwt?: any,
    context?: any,
};

export type ManagerRequest = {
    originalRequest: JSONRequest,
    callback: ManagerCallbackFunction,
    requestId: string,
    queueType: queueType,
    wasOffline: boolean
}

export type SimpleRequest = {
    url: string,
    body: any,
    jwt?: any,
    callback: CallbackFunction,
    context?: any,
    params?: any[]
}

export type CallbackFunction = (data: any, status: number, context?: any) => void;
export type ManagerCallbackFunction = (data: any, status: number, queueId: number, requestId: string) => void;
export type RequestCallBackFunction = (data: any, status: number, associatedStateName: string, wasOffline?: boolean) => void;
