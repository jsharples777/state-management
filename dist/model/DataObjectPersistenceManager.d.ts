import { StateManager } from "../state/interface/StateManager";
import { DataObject } from "./DataObject";
declare type StateManagerForType = {
    type: string;
    manager: StateManager;
};
export declare class DataObjectPersistenceManager {
    private static _instance;
    protected typeManagers: StateManagerForType[];
    private constructor();
    static getInstance(): DataObjectPersistenceManager;
    addStateManagerForDataObjectType(type: string, manager: StateManager): void;
    persist(dataObj: DataObject): void;
    delete(dataObj: DataObject): void;
}
export {};
