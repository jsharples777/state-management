import { IDBPObjectStore } from "idb";
import { IndexedDBStateManager } from "./IndexedDBStateManager";
export declare type collection = {
    name: string;
    keyField: string;
};
export declare class EncryptedIndexedDBStateManager extends IndexedDBStateManager {
    constructor();
    initialise(dbName: string, collections: collection[]): Promise<void>;
    addNewItemToCollection(key: string, item: any, keyField?: string): Promise<void>;
    updateItemInCollection(key: string, item: any, keyField?: string): Promise<void>;
    getWithCollectionKey(key: string, keyField?: string): Promise<void>;
    protected callbackForAddItem(data: any, associatedStateName: string): Promise<void>;
    protected saveItemsToCollection(objectStore: IDBPObjectStore, saveData: any[], keyField?: string): Promise<void>;
}
