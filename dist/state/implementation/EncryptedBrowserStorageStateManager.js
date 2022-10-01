import debug from 'debug';
import { BrowserStorageStateManager } from "./BrowserStorageStateManager";
import { SecurityManager } from "../../security/SecurityManager";
const lsLogger = debug('browser-storage-encrypted');
export class EncryptedBrowserStorageStateManager extends BrowserStorageStateManager {
    constructor(useLocalStorage = false, defaultEq, equalFns = null) {
        super(useLocalStorage, true, defaultEq, equalFns);
        this._addNewNamedStateToStorage = this._addNewNamedStateToStorage.bind(this);
    }
    _addNewNamedStateToStorage(state) {
        lsLogger(`Saving with key ${state.name}`);
        lsLogger(state);
        const stringifiedSaveData = SecurityManager.getInstance().encryptObject(state.value);
        lsLogger(stringifiedSaveData);
        const userStateName = SecurityManager.getInstance().getLoggedInUsername().trim() + '.' + state.name;
        this.storage.setItem(userStateName, stringifiedSaveData);
    }
    _getState(name) {
        let state = {
            name: name,
            value: [],
            hasBeenSet: false
        };
        lsLogger(`Loading with key ${name}`);
        const userStateName = SecurityManager.getInstance().getLoggedInUsername().trim() + '.' + name;
        const savedResultsJSON = this.storage.getItem(userStateName);
        if (savedResultsJSON !== null) {
            state.value = SecurityManager.getInstance().decryptObject(savedResultsJSON);
            state.hasBeenSet = true;
            lsLogger(`Loading with key ${name} decrypted to `);
            lsLogger(state.value);
        }
        return state;
    }
}
//# sourceMappingURL=EncryptedBrowserStorageStateManager.js.map