import { DataObjectListener } from "./DataObjectListener";
export declare abstract class DataObjectController {
    protected listeners: DataObjectListener[];
    protected isCreatingNew: boolean;
    protected typeName: string;
    protected constructor(typeName: string);
    addListener(listener: DataObjectListener): void;
    startNewObject(dataObj: any | null): boolean;
    isCreatingNewObject(): boolean;
    protected informListenersOfCreate(dataObj: any): void;
    protected informListenersOfUpdate(dataObj: any): void;
    protected informListenersOfDelete(dataObj: any): void;
    protected abstract _startNewObject(dataObj: any | null): boolean;
}
