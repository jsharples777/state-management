import { StateEventType } from "../state/interface/StateManager";
import { AbstractAsynchronousStateManager } from "../state/implementation/AbstractAsynchronousStateManager";
import { IndexedDBStateManager } from "../state/implementation/IndexedDBStateManager";
import moment from "moment";
import { FIELD_CreatedBy, FIELD_CreatedOn, FIELD_ModifiedBy, FIELD_ModifiedOn } from "../model/BasicObjectDefinitionFactory";
import { SecurityManager } from "../security/SecurityManager";
export class CachedStateManager extends AbstractAsynchronousStateManager {
    constructor(sourceSM, storageSM, stateNames, merger) {
        super('1', 'cachedsm');
        this.sourceSM = sourceSM;
        this.storageSM = storageSM;
        stateNames.forEach((name) => {
            this.sourceSM.addChangeListenerForName(name, this);
            this.storageSM.addChangeListenerForName(name, this);
        });
        this.merger = merger;
    }
    _addItemToState(name, stateObj, isPersisted) {
        const modified = parseInt(moment().format('YYYYMMDDHHmmss'));
        stateObj[FIELD_CreatedOn] = modified;
        stateObj[FIELD_CreatedBy] = SecurityManager.getInstance().getLoggedInUsername();
        stateObj[FIELD_ModifiedOn] = modified;
        stateObj[FIELD_ModifiedBy] = SecurityManager.getInstance().getLoggedInUsername();
        this.sourceSM.addNewItemToState(name, stateObj, isPersisted);
        this.storageSM.addNewItemToState(name, stateObj, isPersisted);
    }
    _addNewNamedStateToStorage(state) {
    }
    _ensureStatePresent(name) {
    }
    _findItemInState(name, item) {
        this.storageSM.findItemInState(name, item);
    }
    _findItemsInState(name, filters) {
        return [];
    }
    _getState(name) {
        this.sourceSM.getStateByName(name);
        return { name: name, value: undefined, hasBeenSet: true };
    }
    _removeItemFromState(name, stateObj, isPersisted) {
        this.sourceSM.removeItemFromState(name, stateObj, isPersisted);
        this.storageSM.removeItemFromState(name, stateObj, isPersisted);
    }
    _replaceNamedStateInStorage(state) {
    }
    _saveState(name, stateObj) {
    }
    _updateItemInState(name, stateObj, isPersisted) {
        const modified = parseInt(moment().format('YYYYMMDDHHmmss'));
        stateObj[FIELD_ModifiedOn] = modified;
        stateObj[FIELD_ModifiedBy] = SecurityManager.getInstance().getLoggedInUsername();
        this.sourceSM.addNewItemToState(name, stateObj, isPersisted);
        this.storageSM.addNewItemToState(name, stateObj, isPersisted);
    }
    filterResults(managerName, name, filterResults) {
    }
    foundResult(managerName, name, foundItem) {
        if (managerName === IndexedDBStateManager.NAME) {
            // check to see if modified
            this.sourceSM.findItemInState(name, foundItem);
        }
        else {
            this.delegate.informChangeListenersForStateWithName(name, foundItem, StateEventType.FindItem, null);
            this.storageSM.updateItemInState(name, foundItem, false);
        }
    }
    getListenerName() {
        return "cache";
    }
    itemNotModified(managerName, name, item) {
        if (managerName !== IndexedDBStateManager.NAME) {
        }
    }
    stateChanged(managerName, name, newValue) {
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
    }
}
//# sourceMappingURL=CachedStateManager.js.map