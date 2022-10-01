import { JSONRequest } from "./Types";
import { StateChangeListener } from "../state/interface/StateChangeListener";
export declare class OfflineManager implements StateChangeListener {
    static LOCALSTORAGE_KEY_USE_ENCRYPTION: string;
    private static _instance;
    private static DB_NAME;
    private static OBJECT_STORE;
    private persistence;
    constructor();
    static getInstance(): OfflineManager;
    processQueuedResults(): void;
    serverBackOnline(): void;
    areWeOffline(): boolean;
    addOfflineRequest(jsonRequest: JSONRequest): void;
    getListenerName(): string;
    stateChanged(managerName: string, name: string, offlineResults: any): void;
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;
    filterResults(managerName: string, name: string, filterResults: any): void;
    foundResult(managerName: string, name: string, foundItem: any): void;
}
