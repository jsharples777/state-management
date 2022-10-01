export declare enum DataChangeType {
    create = "create",
    update = "update",
    delete = "delete",
    batchCreate = "batchCreate",
    batchUpdate = "batchUpdate",
    batchDelete = "batchDelete",
    custom1 = "custom1",
    custom2 = "custom2",
    custom3 = "custom3",
    custom4 = "custom4",
    custom5 = "custom5",
    custom6 = "custom6",
    custom7 = "custom7",
    custom8 = "custom8",
    custom9 = "custom9"
}
export declare type ClientDataMessage = {
    type: DataChangeType;
    stateName: string;
    data: any;
    user: string;
    context?: string;
};
export interface SocketListener {
    handleDataChangedByAnotherUser(message: ClientDataMessage): void;
    handleMessage(message: string): void;
}
