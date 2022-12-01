var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import debug from 'debug';
import { openDB } from "idb";
import { StateEventType, StateManagerType } from "../interface/StateManager";
import { AbstractAsynchronousStateManager } from "./AbstractAsynchronousStateManager";
const logger = debug('indexeddb-ts');
const loggerInit = debug('indexeddb-ts:init');
export class IndexedDBStateManager extends AbstractAsynchronousStateManager {
    constructor() {
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
    static getInstance() {
        if (!IndexedDBStateManager.instance) {
            IndexedDBStateManager.instance = new IndexedDBStateManager();
        }
        return IndexedDBStateManager.instance;
    }
    initialise(dbName, collections) {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`opening database for ${dbName} with collections`);
            logger(collections);
            this.dbName = dbName;
            this.collections = collections;
            this.collections.forEach((collection) => {
                this.addStateNameToConfigurations(collection.name);
            });
            const isOpen = yield this.openDatabase(dbName, collections);
            if (!isOpen) {
                logger('Configuration change required, delete the database');
            }
            this.initialised = true;
        });
    }
    _addNewNamedStateToStorage(state) {
    }
    _getState(name) {
        if (this.hasCompletedRun(name)) {
            logger(`Getting All ${name} - not done - previously retrieved`);
        }
        else {
            if (!this.isRunInProgress(name)) {
                this.setRunInProgress(name);
                logger(`getting state ${name}`);
                this.getWithCollectionKey(name, this.getKeyFieldForKey(name));
            }
        }
        let state = { name: name, value: [], hasBeenSet: false };
        return state;
    }
    _ensureStatePresent(name) {
    } // should be present with initialise
    _replaceNamedStateInStorage(state) {
        let fn = () => __awaiter(this, void 0, void 0, function* () {
            logger(`replacing item in storage ${state.name}`);
            logger(state.value);
            yield this.removeAllItemsFromCollectionKey(state.name, this.getKeyFieldForKey(state.name));
            yield this.saveWithCollectionKey(state.name, state.value, this.getKeyFieldForKey(state.name));
        });
        fn();
    }
    _addItemToState(name, stateObj, isPersisted = false) {
        if (isPersisted)
            return;
        this.addNewItemToCollection(name, stateObj, this.getKeyFieldForKey(name));
    }
    _removeItemFromState(name, stateObj, isPersisted) {
        if (isPersisted)
            return;
        this.removeItemFromCollection(name, stateObj, this.getKeyFieldForKey(name));
    }
    _updateItemInState(name, stateObj, isPersisted) {
        if (isPersisted)
            return;
        this.updateItemInCollection(name, stateObj, this.getKeyFieldForKey(name));
    }
    _saveState(name, stateObj) {
        let fn = () => __awaiter(this, void 0, void 0, function* () {
            logger(`saving state ${name}`);
            yield this.removeAllItemsFromCollectionKey(name, this.getKeyFieldForKey(name));
            yield this.saveWithCollectionKey(name, stateObj, this.getKeyFieldForKey(name));
        });
        fn();
    }
    saveWithCollectionKey(key, saveData, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`Saving array with key ${key}`);
            logger(saveData);
            let db = yield openDB(this.dbName);
            // @ts-ignore
            let transaction = db.transaction([key], "readwrite");
            transaction.oncomplete = function (ev) {
                logger('Success');
                logger(ev);
            };
            transaction.onerror = function (ev) {
                logger('Error');
                logger(ev);
            };
            // @ts-ignore
            let objectStore = transaction.store;
            // @ts-ignore
            yield this.saveItemsToCollection(objectStore, saveData, keyField);
        });
    }
    addItemInCollectionUsingConfig(key, item) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.addNewItemToCollection(key, item, this.getKeyFieldForKey(key));
        });
    }
    /* add a new item to the local storage if not already there */
    addNewItemToCollection(key, item, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            if (item !== null) {
                logger(`Adding with key ${key}`);
                logger(item);
                let db = yield openDB(this.dbName);
                // @ts-ignore
                let transaction = db.transaction([key], "readwrite").objectStore(key).add(item);
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
        });
    }
    removeItemInCollectionUsingConfig(key, item) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.removeItemFromCollection(key, item, this.getKeyFieldForKey(key));
        });
    }
    removeItemFromCollection(key, item, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            if (item !== null) {
                logger(`Removing with key ${key} item ${item[keyField]}`);
                logger(item);
                let db = yield openDB(this.dbName);
                // @ts-ignore
                let transaction = db.transaction([key], "readwrite").objectStore(key).delete(item[keyField]);
                transaction.oncomplete = function (ev) {
                    logger('Success');
                    logger(ev);
                };
                transaction.onerror = function (ev) {
                    logger('Error');
                    logger(ev);
                };
                yield transaction.done;
                this.callbackForRemoveItem(item, key);
            }
            return item;
        });
    }
    updateItemInCollectionUsingConfig(key, item) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.updateItemInCollection(key, item, this.getKeyFieldForKey(key));
        });
    }
    updateItemInCollection(key, item, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            if (item) {
                logger(`Updating item in storage ${key} with keyField path of ${keyField}`);
                logger(item);
                let db = yield openDB(this.dbName);
                // @ts-ignore
                let transaction = db.transaction([key], "readwrite").objectStore(key).put(item);
                transaction.oncomplete = function (ev) {
                    logger('Success');
                    logger(ev);
                };
                transaction.onerror = function (ev) {
                    logger('Error');
                    logger(ev);
                };
                // @ts-ignore
                yield transaction.done;
                this.callbackForUpdateItem(item, key);
            }
            return item;
        });
    }
    setStateByName(name, stateObjectForName, informListeners) {
        this._replaceNamedStateInStorage({ name: name, value: stateObjectForName, hasBeenSet: true });
        if (informListeners)
            this.delegate.informChangeListenersForStateWithName(name, stateObjectForName, StateEventType.StateChanged, null);
    }
    getCollectionUsingConfig(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getWithCollectionKey(key, this.getKeyFieldForKey(key));
        });
    }
    getWithCollectionKey(key, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            let savedResults = [];
            logger(`Loading with key ${key}`);
            let db = yield openDB(this.dbName);
            yield this.checkForObjectStore(db, key, keyField);
            // @ts-ignore
            let transaction = db.transaction([key]);
            // @ts-ignore
            let objectStore = transaction.store;
            // @ts-ignore
            let cursor = yield objectStore.openCursor();
            while (cursor) {
                // @ts-ignore
                savedResults.push(cursor.value);
                // @ts-ignore
                cursor = yield cursor.continue();
            }
            logger(savedResults);
            this.callbackForGetItems(savedResults, key);
        });
    }
    _findItemsInState(name, filters) {
        return [];
    }
    getType() {
        return StateManagerType.AsyncLocal;
    }
    _findItemInState(name, item) {
        logger(`finding item ${name}`);
        logger(item);
        this.findItemInCollection(name, this.getKeyFieldForKey(name));
        return undefined;
    }
    findItemInCollectionUsingConfig(key, item) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findItemInCollection(key, item, this.getKeyFieldForKey(key));
        });
    }
    findItemInCollection(key, item, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`Loading with key ${key}`);
            let db = yield openDB(this.dbName);
            yield this.checkForObjectStore(db, key, keyField);
            // @ts-ignore
            let transaction = db.transaction([key]);
            // @ts-ignore
            let objectStore = transaction.store;
            const id = item[keyField];
            const foundItem = yield objectStore.get(id);
            logger(foundItem);
            this.callbackForFindItem(foundItem, key);
            return foundItem;
        });
    }
    getKeyFieldForKey(key) {
        let result = '_id';
        const foundIndex = this.collections.findIndex((collection) => collection.name === key);
        if (foundIndex >= 0) {
            result = this.collections[foundIndex].keyField;
        }
        return result;
    }
    checkForObjectStore(db, key, keyField) {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`Checking for collection ${key}`);
            if (!db.objectStoreNames.contains(key)) {
                // @ts-ignore
                logger(`Checking for collection ${key} - NOT found, creating`);
                yield db.createObjectStore(key, { keyPath: keyField, autoIncrement: false });
            }
        });
    }
    saveItemsToCollection(objectStore, saveData, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`Saving items to collection`);
            saveData.forEach((data) => {
                // @ts-ignore
                objectStore.add(data);
            });
        });
    }
    removeAllItemsFromCollectionKey(key, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`Clearing collection ${key}`);
            let db = yield openDB(this.dbName);
            yield this.checkForObjectStore(db, key, keyField);
            // @ts-ignore
            let transaction = db.transaction([key], "readwrite");
            // @ts-ignore
            let objectStore = transaction.store;
            // @ts-ignore
            yield objectStore.clear();
        });
    }
    callbackForRemoveItem(data, associatedStateName) {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`callback for remove item for state ${associatedStateName}  - not forwarded`);
            logger(data);
        });
    }
    callbackForUpdateItem(data, associatedStateName) {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`callback for update item for state ${associatedStateName}  - not forwarded`);
            logger(data);
        });
    }
    callbackForFindItem(data, associatedStateName) {
        logger(`callback for find item for state ${associatedStateName} - FORWARDING`);
        logger(data);
        this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.FindItem, null);
    }
    callbackForGetItems(data, associatedStateName) {
        logger(`callback for get items for state ${associatedStateName} - FORWARDING`);
        logger(data);
        this.setCompletedRun(associatedStateName, data);
        this.clearRunInProgress(associatedStateName);
        this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.StateChanged, null);
    }
    callbackForAddItem(data, associatedStateName) {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`callback for add item for state ${associatedStateName}  - FORWARDING`);
            logger(data);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.ItemAdded, null);
        });
    }
    openDatabase(dbName, collections) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = true;
            try {
                let db = yield openDB(this.dbName);
                let currentVersion = db.version;
                // do we have any new collections?
                let collectionsToCreate = [];
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
                yield openDB(dbName, currentVersion, {
                    upgrade(db, oldVersion, newVersion, transaction) {
                        collectionsToCreate.forEach((collection) => {
                            loggerInit(`creating collection for ${collection.name} with key ${collection.keyField} in database version ${currentVersion}`);
                            db.createObjectStore(collection.name, { keyPath: collection.keyField, autoIncrement: false });
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
            }
            catch (error) {
                result = false;
                logger(error);
                loggerInit(`Deleting database ${dbName}`);
                yield indexedDB.deleteDatabase(dbName);
                loggerInit(`Re-opening database ${dbName}`);
                return yield this.openDatabase(dbName, collections);
            }
            return result;
        });
    }
    deleteDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            yield indexedDB.deleteDatabase(this.dbName);
        });
    }
}
IndexedDBStateManager.NAME = 'indexeddb';
//# sourceMappingURL=IndexedDBStateManager.js.map