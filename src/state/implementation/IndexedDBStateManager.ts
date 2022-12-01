import debug from 'debug';
import {IDBPDatabase, IDBPObjectStore, IDBPTransaction, openDB} from "idb";
import {StateEventType, StateManagerType, StateValue} from "../interface/StateManager";
import {FilterItem} from "../../CommonTypes";
import {AbstractAsynchronousStateManager} from "./AbstractAsynchronousStateManager";


const logger = debug('indexeddb-ts');
const loggerInit = debug('indexeddb-ts:init');

export type CollectionConfig = {
    name: string,
    keyField: string
};

export class IndexedDBStateManager extends AbstractAsynchronousStateManager {
    public static NAME = 'indexeddb';
    private static instance: IndexedDBStateManager;
    protected dbName: string;
    protected collections: CollectionConfig[];

    public constructor() {
        super(IndexedDBStateManager.NAME, IndexedDBStateManager.NAME);
        this.dbName = 'default';
        this.collections = [];

        this.callbackForAddItem = this.callbackForAddItem.bind(this);
        this.callbackForRemoveItem = this.callbackForRemoveItem.bind(this);
        this.callbackForUpdateItem = this.callbackForUpdateItem.bind(this);
        this.callbackForGetItems = this.callbackForGetItems.bind(this);

        this.setStateByName = this.setStateByName.bind(this);
        this.getType = this.getType.bind(this);
    }

    public static getInstance(): IndexedDBStateManager {
        if (!IndexedDBStateManager.instance) {
            IndexedDBStateManager.instance = new IndexedDBStateManager();
        }
        return IndexedDBStateManager.instance;
    }

    public async initialise(dbName: string, collections: CollectionConfig[]) {
        logger(`opening database for ${dbName} with collections`);
        logger(collections);
        this.dbName = dbName;
        this.collections = collections;

        this.collections.forEach((collection) => {
            this.addStateNameToConfigurations(collection.name);
        });

        const isOpen = await this.openDatabase(dbName, collections);
        if (!isOpen) {
            logger('Configuration change required, delete the database')
        }

        this.initialised = true;
    }

    public _addNewNamedStateToStorage(state: StateValue): void {
    }

    public _getState(name: string): StateValue {
        if (this.hasCompletedRun(name)) {
            logger(`Getting All ${name} - not done - previously retrieved`);
        } else {
            if (!this.isRunInProgress(name)) {
                this.setRunInProgress(name);
                logger(`getting state ${name}`);
                this.getWithCollectionKey(name, this.getKeyFieldForKey(name));

            }
        }
        let state: StateValue = {name: name, value: [], hasBeenSet: false};
        return state;
    }

    public _ensureStatePresent(name: string): void {
    } // should be present with initialise

    public _replaceNamedStateInStorage(state: StateValue): void {
        let fn = async () => {
            logger(`replacing item in storage ${state.name}`);
            logger(state.value);
            await this.removeAllItemsFromCollectionKey(state.name, this.getKeyFieldForKey(state.name));
            await this.saveWithCollectionKey(state.name, state.value, this.getKeyFieldForKey(state.name));
        }
        fn();
    }

    _addItemToState(name: string, stateObj: any, isPersisted: boolean = false): void {
        if (isPersisted) return;
        this.addNewItemToCollection(name, stateObj, this.getKeyFieldForKey(name));
    }

    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void {
        if (isPersisted) return;
        this.removeItemFromCollection(name, stateObj, this.getKeyFieldForKey(name));
    }

    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void {
        if (isPersisted) return;
        this.updateItemInCollection(name, stateObj, this.getKeyFieldForKey(name));
    }

    public _saveState(name: string, stateObj: any): void {
        let fn = async () => {
            logger(`saving state ${name}`);
            await this.removeAllItemsFromCollectionKey(name, this.getKeyFieldForKey(name));
            await this.saveWithCollectionKey(name, stateObj, this.getKeyFieldForKey(name));
        }
        fn();
    }

    public async saveWithCollectionKey(key: string, saveData: any[], keyField: string = 'id') {
        logger(`Saving array with key ${key}`);
        logger(saveData);
        let db: IDBPDatabase = await openDB(this.dbName);
        // @ts-ignore
        let transaction: IDBPTransaction = db.transaction([key], "readwrite");
        transaction.oncomplete = function (ev) {
            logger('Success');
            logger(ev);
        };
        transaction.onerror = function (ev) {
            logger('Error');
            logger(ev);
        };
        // @ts-ignore
        let objectStore: IDBPObjectStore = transaction.store;
        // @ts-ignore
        await this.saveItemsToCollection(objectStore, saveData, keyField);
    }

    public async addItemInCollectionUsingConfig(key:string, item:any):Promise<any> {
        return await this.addNewItemToCollection(key, item, this.getKeyFieldForKey(key));
    }


    /* add a new item to the local storage if not already there */
    public async addNewItemToCollection(key: string, item: any, keyField: string = 'id') {
        if (item !== null) {
            logger(`Adding with key ${key}`);
            logger(item);
            let db: IDBPDatabase = await openDB(this.dbName);

            // @ts-ignore
            let transaction: IDBPTransaction = db.transaction([key], "readwrite").objectStore(key).add(item);
            transaction.oncomplete = function (ev) {
                logger('Success');
                logger(ev);
            };
            transaction.onerror = function (ev) {
                logger('Error');
                logger(ev);
            };
            this.callbackForAddItem(item, key);
        }
        return item;
    }
    public async removeItemInCollectionUsingConfig(key:string, item:any):Promise<any> {
        return await this.removeItemFromCollection(key, item, this.getKeyFieldForKey(key));
    }


    public async removeItemFromCollection(key: string, item: any, keyField: string = 'id') {
        if (item !== null) {
            logger(`Removing with key ${key} item ${item[keyField]}`);
            logger(item);
            let db: IDBPDatabase = await openDB(this.dbName);

            // @ts-ignore
            let transaction: IDBPTransaction = db.transaction([key], "readwrite").objectStore(key).delete(item[keyField]);
            transaction.oncomplete = function (ev) {
                logger('Success');
                logger(ev);
            };
            transaction.onerror = function (ev) {
                logger('Error');
                logger(ev);
            };
            await transaction.done;
            this.callbackForRemoveItem(item, key);

        }
        return item;
    }

    public async updateItemInCollectionUsingConfig(key:string, item:any):Promise<any> {
        return await this.updateItemInCollection(key, item, this.getKeyFieldForKey(key));
    }


    public async updateItemInCollection(key: string, item: any, keyField: string = 'id') {
        if (item) {
            logger(`Updating item in storage ${key} with keyField path of ${keyField}`);
            logger(item);
            let db: IDBPDatabase = await openDB(this.dbName);

            // @ts-ignore
            let transaction: IDBPTransaction = db.transaction([key], "readwrite").objectStore(key).put(item);
            transaction.oncomplete = function (ev) {
                logger('Success');
                logger(ev);
            };
            transaction.onerror = function (ev) {
                logger('Error');
                logger(ev);
            };
            // @ts-ignore
            await transaction.done;
            this.callbackForUpdateItem(item, key);
        }
        return item;
    }

    setStateByName(name: string, stateObjectForName: any, informListeners: boolean): void {
        this._replaceNamedStateInStorage({name: name, value: stateObjectForName, hasBeenSet: true});
        if (informListeners) this.delegate.informChangeListenersForStateWithName(name, stateObjectForName, StateEventType.StateChanged, null);
    }

    public async getCollectionUsingConfig(key:string):Promise<any> {
        return await this.getWithCollectionKey(key, this.getKeyFieldForKey(key));
    }


    public async getWithCollectionKey(key: string, keyField: string = 'id') {
        let savedResults: any[] = [];
        logger(`Loading with key ${key}`);
        let db: IDBPDatabase = await openDB(this.dbName);
        await this.checkForObjectStore(db, key, keyField);

        // @ts-ignore
        let transaction: IDBPTransaction = db.transaction([key]);
        // @ts-ignore
        let objectStore: IDBPObjectStore = transaction.store;
        // @ts-ignore
        let cursor: IDBPCursor = await objectStore.openCursor();

        while (cursor) {
            // @ts-ignore
            savedResults.push(cursor.value);
            // @ts-ignore
            cursor = await cursor.continue();
        }

        logger(savedResults);
        this.callbackForGetItems(savedResults, key);

    }

    _findItemsInState(name: string, filters: FilterItem[]): any[] {
        return [];
    }

    getType(): StateManagerType {
        return StateManagerType.AsyncLocal;
    }

    _findItemInState(name: string, item: any): any {
        logger(`finding item ${name}`);
        logger(item);
        this.findItemInCollection(name, this.getKeyFieldForKey(name));
        return undefined;
    }

    public async findItemInCollectionUsingConfig(key:string, item:any):Promise<any> {
        return await this.findItemInCollection(key, item, this.getKeyFieldForKey(key));
    }

    public async findItemInCollection(key: string, item:any, keyField: string = 'id'):Promise<any> {
        logger(`Loading with key ${key}`);
        let db: IDBPDatabase = await openDB(this.dbName);
        await this.checkForObjectStore(db, key, keyField);

        // @ts-ignore
        let transaction: IDBPTransaction = db.transaction([key]);
        // @ts-ignore
        let objectStore: IDBPObjectStore = transaction.store;

        const id = item[keyField];
        const foundItem = await objectStore.get(id);
        logger(foundItem);
        this.callbackForFindItem(foundItem, key);
        return foundItem;

    }

    public getKeyFieldForKey(key: string): string {
        let result = '_id';
        const foundIndex = this.collections.findIndex((collection) => collection.name === key);
        if (foundIndex >= 0) {
            result = this.collections[foundIndex].keyField;
        }
        return result;
    }

    protected async checkForObjectStore(db: IDBPDatabase, key: string, keyField: string) {
        logger(`Checking for collection ${key}`);
        if (!db.objectStoreNames.contains(key)) {
            // @ts-ignore
            logger(`Checking for collection ${key} - NOT found, creating`);
            await db.createObjectStore(key, {keyPath: keyField, autoIncrement: false});
        }
    }

    protected async saveItemsToCollection(objectStore: IDBPObjectStore, saveData: any[], keyField: string = 'id') {
        logger(`Saving items to collection`);
        saveData.forEach((data) => {
            // @ts-ignore
            objectStore.add(data);
        });
    }

    protected async removeAllItemsFromCollectionKey(key: string, keyField: string = 'id') {
        logger(`Clearing collection ${key}`);
        let db: IDBPDatabase = await openDB(this.dbName);
        await this.checkForObjectStore(db, key, keyField);
        // @ts-ignore
        let transaction: IDBPTransaction = db.transaction([key], "readwrite");
        // @ts-ignore
        let objectStore: IDBPObjectStore = transaction.store;
        // @ts-ignore
        await objectStore.clear();
    }

    protected async callbackForRemoveItem(data: any, associatedStateName: string) {
        logger(`callback for remove item for state ${associatedStateName}  - not forwarded`);
        logger(data);
    }

    protected async callbackForUpdateItem(data: any, associatedStateName: string) {
        logger(`callback for update item for state ${associatedStateName}  - not forwarded`);
        logger(data);
    }

    protected callbackForFindItem(data: any, associatedStateName: string) {
        logger(`callback for find item for state ${associatedStateName} - FORWARDING`);
        logger(data);
        this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.FindItem, null);
    }

    protected callbackForGetItems(data: any, associatedStateName: string) {
        logger(`callback for get items for state ${associatedStateName} - FORWARDING`);
        logger(data);
        this.setCompletedRun(associatedStateName, data);
        this.clearRunInProgress(associatedStateName);

        this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.StateChanged, null);
    }

    protected async callbackForAddItem(data: any, associatedStateName: string) {
        logger(`callback for add item for state ${associatedStateName}  - FORWARDING`);
        logger(data);
        this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.ItemAdded, null);
    }

    private async openDatabase(dbName: string, collections: CollectionConfig[]): Promise<boolean> {
        let result = true;
        try {
            let db: IDBPDatabase = await openDB(this.dbName);
            let currentVersion = db.version;
            // do we have any new collections?
            let collectionsToCreate: CollectionConfig[] = [];
            collections.forEach((collection) => {
                loggerInit(`checking for collection ${collection.name} with key ${collection.keyField} with database version ${currentVersion}`);
                if (!db.objectStoreNames.contains(collection.name)) {
                    loggerInit(`collection ${collection.name} not present in database version ${currentVersion}`);
                    collectionsToCreate.push(collection);
                }
            });
            db.close();
            if (collectionsToCreate.length > 0) {
                currentVersion++;
            }

            await openDB(dbName, currentVersion, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    collectionsToCreate.forEach((collection) => {
                        loggerInit(`creating collection for ${collection.name} with key ${collection.keyField} in database version ${currentVersion}`)
                        db.createObjectStore(collection.name, {keyPath: collection.keyField, autoIncrement: false});
                    });
                },
                blocked() {
                    // …
                },
                blocking() {
                    // …
                },
                terminated() {
                    // …
                },
            });
        } catch (error) {
            result = false;
            logger(error);
            loggerInit(`Deleting database ${dbName}`);
            await indexedDB.deleteDatabase(dbName);
            loggerInit(`Re-opening database ${dbName}`);
            return await this.openDatabase(dbName, collections);
        }
        return result;
    }

    public async deleteDatabase() {
        await indexedDB.deleteDatabase(this.dbName);
    }


}

