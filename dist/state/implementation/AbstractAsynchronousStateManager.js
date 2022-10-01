import { StateEventType, StateManagerType } from "../interface/StateManager";
import { StateContextDelegate } from "../delegate/StateContextDelegate";
import { StateChangedDelegate } from "../delegate/StateChangedDelegate";
import debug from "debug";
const logger = debug('abstract-async-state-manager');
export class AbstractAsynchronousStateManager {
    constructor(id, managerName) {
        this.contextDelegate = null;
        this.initialised = false;
        this.delegate = new StateChangedDelegate(managerName);
        this.emitEvents();
        this.bHasCompletedRun = [];
        this.bIsRunInProgress = [];
        this.managerName = managerName;
        this.stateBuffers = [];
    }
    addChangeListenerForName(name, listener) {
        this.delegate.addChangeListenerForName(name, listener);
        /* have we already completed the run for the state? */
        if (this.hasCompletedRun(name)) {
            let foundIndex = this.stateBuffers.findIndex(element => element.name === name);
            if (foundIndex >= 0) {
                let state = this.stateBuffers[foundIndex];
                listener.stateChanged(this.managerName, name, state.value);
            }
        }
    }
    addStateNameToConfigurations(stateName) {
        let state = {
            name: stateName,
            value: [],
            hasBeenSet: false
        };
        this.stateBuffers.push(state);
        this.bIsRunInProgress.push(false);
        this.bHasCompletedRun.push(false);
    }
    forceResetForGet(stateName) {
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            this.bHasCompletedRun[foundIndex] = false;
            this.bIsRunInProgress[foundIndex] = false;
        }
    }
    getConfiguredStateNames() {
        let results = [];
        this.stateBuffers.forEach((config) => {
            results.push(config.name);
        });
        return results;
    }
    hasCompletedRun(stateName) {
        let result = false;
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            result = this.bHasCompletedRun[foundIndex];
        }
        return result;
    }
    setCompletedRun(stateName, values) {
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            this.bHasCompletedRun[foundIndex] = true;
            this.bIsRunInProgress[foundIndex] = false;
            this.stateBuffers[foundIndex].value = values;
        }
    }
    isRunInProgress(stateName) {
        let result = false;
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            result = this.bIsRunInProgress[foundIndex];
        }
        return result;
    }
    setRunInProgress(stateName) {
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            this.bIsRunInProgress[foundIndex] = true;
        }
    }
    clearRunInProgress(stateName) {
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            this.bIsRunInProgress[foundIndex] = false;
        }
    }
    setContextSupplier(name, supplier) {
        this.contextDelegate = new StateContextDelegate(this, name, supplier);
    }
    stateContextChanged(newContext) {
    }
    addNewItemToState(name, item, isPersisted) {
        this._addItemToState(name, item, isPersisted);
    }
    emitEvents() {
        this.delegate.emitEvents();
    }
    findItemInState(name, item) {
        return this._findItemInState(name, item);
    }
    getStateByName(name) {
        let result = [];
        if (this.isRunInProgress(name)) {
            logger(`Getting state for name ${name} in progress`);
            return [];
        }
        else if (this.hasCompletedRun(name)) {
            logger(`Getting state for name ${name} has already completed`);
            let foundIndex = this.stateBuffers.findIndex(element => element.name === name);
            if (foundIndex >= 0) {
                let state = this.stateBuffers[foundIndex];
                result = state.value;
            }
        }
        else {
            this._getState(name);
        }
        return result;
    }
    informChangeListenersForStateWithName(name, stateObjValue, eventType, previousObjValue) {
        this.delegate.informChangeListenersForStateWithName(name, stateObjValue, eventType, previousObjValue);
    }
    isItemInState(name, item) {
        return true;
    }
    removeItemFromState(name, item, isPersisted) {
        logger(`Removing item from state ${name} is persisted ${isPersisted}`);
        logger(item);
        this._removeItemFromState(name, item, isPersisted);
        return true;
    }
    setStateByName(name, stateObjectForName, informListeners) {
        // state supplied from elsewhere, set run completed
    }
    suppressEvents() {
        this.delegate.suppressEvents();
    }
    updateItemInState(name, item, isPersisted) {
        this._updateItemInState(name, item, isPersisted);
        return true;
    }
    findItemsInState(name, filters) {
        return this._findItemsInState(name, filters);
    }
    getType() {
        return StateManagerType.AsyncRemote;
    }
    fireStateChanged(name) {
        if (this.isEmittingEvents()) {
            let foundIndex = this.stateBuffers.findIndex((config) => config.name === name);
            if (foundIndex >= 0) {
                const state = this.stateBuffers[foundIndex];
                this.delegate.informChangeListenersForStateWithName(name, state.value, StateEventType.StateChanged, null);
            }
        }
    }
    fireStateChangedForAllStates() {
        if (this.isEmittingEvents()) {
            this.stateBuffers.forEach((state) => {
                this.delegate.informChangeListenersForStateWithName(state.name, state.value, StateEventType.StateChanged, null);
            });
        }
    }
    isEmittingEvents() {
        return this.delegate.isEmittingEvents();
    }
    getAvailableStateNames() {
        return this.getConfiguredStateNames();
    }
    isInitialised() {
        return this.initialised;
    }
    setInitialised() {
        this.initialised = true;
    }
    postInitialise() {
    }
}
//# sourceMappingURL=AbstractAsynchronousStateManager.js.map