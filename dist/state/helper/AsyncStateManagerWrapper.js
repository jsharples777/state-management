import debug from 'debug';
import { AbstractStateManager } from "../implementation/AbstractStateManager";
const asyncLogger = debug('state-manager-async');
export class AsyncStateManagerWrapper extends AbstractStateManager {
    constructor(topLevelSM, wrappedSM, defaultEq) {
        super('async', defaultEq);
        this.topLevelSM = topLevelSM;
        this.wrappedSM = wrappedSM;
        this.forceSaves = false;
        this.wrappedSM.emitEvents();
        let stateNamesToMonitor = this.wrappedSM.getConfiguredStateNames();
        this.stateChanged = this.stateChanged.bind(this);
        this.stateChangedItemAdded = this.stateChangedItemAdded.bind(this);
        this.stateChangedItemRemoved = this.stateChangedItemRemoved.bind(this);
        this.stateChangedItemUpdated = this.stateChangedItemUpdated.bind(this);
        stateNamesToMonitor.forEach((stateName) => {
            this.wrappedSM.addChangeListenerForName(stateName, this);
        });
    }
    getAvailableStateNames() {
        return this.wrappedSM.getAvailableStateNames();
    }
    getType() {
        return this.wrappedSM.getType();
    }
    _findItemsInState(name, filters) {
        asyncLogger(`finding items with filters`);
        return this.wrappedSM.findItemsInState(name, filters);
    }
    _findItemInState(name, stateObj) {
        asyncLogger(`finding item `);
        return this.wrappedSM.findItemInState(name, stateObj);
    }
    _addItemToState(name, stateObj, isPersisted = false) {
        asyncLogger(`adding item to state ${name} - is persisted ${isPersisted}`);
        this.wrappedSM.addNewItemToState(name, stateObj, isPersisted);
    }
    _getState(name) {
        // assume wrapped SM is asynchronous
        // make the call to get state but supply the caller with an empty state for now
        asyncLogger(`getting state ${name}`);
        this.wrappedSM.getStateByName(name);
        return { name: name, value: [], hasBeenSet: false };
    }
    _removeItemFromState(name, stateObj, isPersisted) {
        asyncLogger(`removing item from state ${name} is persisted ${isPersisted}`);
        this.wrappedSM.removeItemFromState(name, stateObj, isPersisted);
    }
    _updateItemInState(name, stateObj, isPersisted) {
        asyncLogger(`updating item in state ${name}`);
        this.wrappedSM.updateItemInState(name, stateObj, isPersisted);
    }
    _ensureStatePresent(name) {
    } // assume already present
    _addNewNamedStateToStorage(state) {
    } // assume already present
    _replaceNamedStateInStorage(state) {
    } // not implemented, not replacing state wholesale
    _saveState(name, stateObj) {
    } // not implemented, not replacing state wholesale
    stateChangedItemRemoved(managerName, name, itemRemoved) {
    } // not implemented, assumes called to wrapped SM worked
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
    } // not implemented, assumes called to wrapped SM worked
    stateChanged(managerName, name, newValue) {
        // received new state from the wrapped SM
        // pass the received state to the top level SM
        asyncLogger(`Wrapped SM has supplied new state ${name} passing to top level SM`);
        asyncLogger(newValue);
        this.topLevelSM.setStateByName(name, newValue);
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
        asyncLogger(`Wrapped SM has supplied new completed item for state ${name} passing to top level SM`);
        this.topLevelSM.addNewItemToState(name, itemAdded, true);
    }
    getListenerName() {
        return "Async Manager";
    }
    filterResults(managerName, name, filterResults) {
        asyncLogger(`Wrapped SM has supplied filter results ${name} passing to top level SM`);
        this.topLevelSM.receivedFilterResults(name, filterResults);
    }
    foundResult(managerName, name, foundItem) {
        this.topLevelSM.receivedFoundItem(name, foundItem);
    }
    itemNotModified(managerName, name, item) {
        this.topLevelSM.receivedItemNotModified(name, item);
    }
    fireStateChangedForAllStates() {
    }
}
//# sourceMappingURL=AsyncStateManagerWrapper.js.map