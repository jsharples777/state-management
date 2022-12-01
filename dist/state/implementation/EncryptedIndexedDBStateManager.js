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
import { IndexedDBStateManager } from "./IndexedDBStateManager";
import { SecurityManager } from "../../security/SecurityManager";
import { StateEventType } from "../interface/StateManager";
const logger = debug('indexeddb-ts-encrypted');
export class EncryptedIndexedDBStateManager extends IndexedDBStateManager {
    constructor() {
        super();
        this.initialise = this.initialise.bind(this);
        this.addNewItemToCollection = this.addNewItemToCollection.bind(this);
        this.updateItemInCollection = this.updateItemInCollection.bind(this);
        this.getWithCollectionKey = this.getWithCollectionKey.bind(this);
        this.callbackForAddItem = this.callbackForAddItem.bind(this);
        this.saveItemsToCollection = this.saveItemsToCollection.bind(this);
    }
    initialise(dbName, collections) {
        const _super = Object.create(null, {
            initialise: { get: () => super.initialise }
        });
        return __awaiter(this, void 0, void 0, function* () {
            logger(`opening encrypted database for ${dbName} with collections`);
            const username = SecurityManager.getInstance().getLoggedInUsername();
            this.dbName = `${username}.${dbName}`;
            _super.initialise.call(this, this.dbName, collections);
        });
    }
    /* add a new item to the local storage if not already there */
    addNewItemToCollection(key, item, keyField = 'id') {
        const _super = Object.create(null, {
            addNewItemToCollection: { get: () => super.addNewItemToCollection }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (item !== null) {
                let encrypted = {};
                // @ts-ignore
                encrypted[keyField] = item[keyField];
                // @ts-ignore
                encrypted.data = SecurityManager.getInstance().encryptObject(item);
                logger(encrypted);
                _super.addNewItemToCollection.call(this, key, encrypted, keyField);
            }
        });
    }
    updateItemInCollection(key, item, keyField = 'id') {
        const _super = Object.create(null, {
            updateItemInCollection: { get: () => super.updateItemInCollection }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (item) {
                let encrypted = {};
                // @ts-ignore
                encrypted[keyField] = item[keyField];
                // @ts-ignore
                encrypted.data = SecurityManager.getInstance().encryptObject(item);
                logger(encrypted);
                _super.updateItemInCollection.call(this, key, encrypted, keyField);
            }
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
                let item = SecurityManager.getInstance().decryptObject(cursor.value.data);
                logger(item);
                // @ts-ignore
                savedResults.push(item);
                // @ts-ignore
                cursor = yield cursor.continue();
            }
            logger(savedResults);
            this.callbackForGetItems(savedResults, key);
        });
    }
    callbackForAddItem(data, associatedStateName) {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`callback for add encrypted item for state ${associatedStateName}  - FORWARDING`);
            let decryptedItem = SecurityManager.getInstance().decryptObject(data.data);
            logger(decryptedItem);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, decryptedItem, StateEventType.ItemAdded, null);
        });
    }
    saveItemsToCollection(objectStore, saveData, keyField = 'id') {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`Saving items to collection`);
            saveData.forEach((data) => {
                let encrypted = {};
                encrypted[keyField] = data[keyField];
                encrypted.data = SecurityManager.getInstance().encryptObject(data);
                // @ts-ignore
                objectStore.add(encrypted);
            });
        });
    }
}
//# sourceMappingURL=EncryptedIndexedDBStateManager.js.map