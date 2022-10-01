import debug from 'debug';
import { AbstractStateManager } from "./AbstractStateManager";
const lsLogger = debug('browser-storage');
export class BrowserStorageStateManager extends AbstractStateManager {
    constructor(useLocalStorage = false, allowPersistence = false, defaultEq, equalFns = null) {
        super('browser', defaultEq, equalFns);
        // @ts-ignore
        this.configuration = [];
        this.initialised = false;
        this.storage = window.sessionStorage;
        this.allowPersistence = allowPersistence;
        if (useLocalStorage)
            this.storage = window.localStorage;
        this.forceSaves = true;
    }
    isInitialised() {
        return this.initialised;
    }
    setInitialised() {
        this.initialised = true;
    }
    setCompletedRun(stateName) {
    }
    _ensureStatePresent(name) {
        if (this.storage.getItem(name) === null) {
            this._addNewNamedStateToStorage({ name: name, value: [], hasBeenSet: false });
        }
    }
    _addNewNamedStateToStorage(state) {
        lsLogger(`Local Storage: Saving with key ${state.name}`);
        lsLogger(state);
        const stringifiedSaveData = JSON.stringify(state.value);
        lsLogger(stringifiedSaveData);
        this.storage.setItem(state.name, stringifiedSaveData);
    }
    _replaceNamedStateInStorage(state) {
        this._addNewNamedStateToStorage(state);
    }
    _getState(name) {
        let state = {
            name: name,
            value: [],
            hasBeenSet: false
        };
        lsLogger(`Local Storage: Loading with key ${name}`);
        const savedResultsJSON = this.storage.getItem(name);
        lsLogger(savedResultsJSON);
        if (savedResultsJSON !== null) {
            state.value = JSON.parse(savedResultsJSON);
            state.hasBeenSet = true;
        }
        return state;
    }
    _saveState(name, newValue) {
        this._addNewNamedStateToStorage({ name: name, value: newValue, hasBeenSet: true });
    }
    _addItemToState(name, stateObj, isPersisted = false) {
        if (!isPersisted) {
            if (!this.allowPersistence) {
                return;
            }
        }
        let state = this._getState(name);
        lsLogger(`adding item to state ${name}`);
        lsLogger(stateObj);
        const valueIndex = state.value.findIndex((element) => this.getEqualityFnForName(name)(element, stateObj));
        if (valueIndex >= 0) {
            state.value.splice(valueIndex, 1, stateObj);
            lsLogger(`item was already in state, updating instead ${name}`);
        }
        else {
            state.value.push(stateObj);
        }
        this._replaceNamedStateInStorage(state);
    }
    _removeItemFromState(name, stateObj, isPersisted) {
        let state = this._getState(name);
        const valueIndex = state.value.findIndex((element) => this.getEqualityFnForName(name)(element, stateObj));
        if (valueIndex >= 0) {
            lsLogger(`removing item from state ${name}`);
            lsLogger(stateObj);
            state.value.splice(valueIndex, 1);
        }
        this._replaceNamedStateInStorage(state);
    }
    _updateItemInState(name, stateObj, isPersisted) {
        let state = this._getState(name);
        const valueIndex = state.value.findIndex((element) => this.getEqualityFnForName(name)(element, stateObj));
        if (valueIndex >= 0) {
            state.value.splice(valueIndex, 1, stateObj);
            lsLogger(`updating item in state ${name}`);
            lsLogger(stateObj);
        }
        this._replaceNamedStateInStorage(state);
    }
    forceResetForGet(stateName) {
    }
    getConfiguredStateNames() {
        return this.configuration;
    }
    hasCompletedRun(stateName) {
        return false;
    }
    initialise(config) {
        this.configuration = config;
        this.initialised = true;
    }
    fireStateChangedForAllStates() {
        if (this.isEmittingEvents()) {
            const stateNames = this.getConfiguredStateNames();
            stateNames.forEach((name) => {
                const state = this._getState(name);
                this.informChangeListenersForStateWithName(name, state.value);
            });
        }
    }
    getAvailableStateNames() {
        return this.getConfiguredStateNames();
    }
}
//# sourceMappingURL=BrowserStorageStateManager.js.map