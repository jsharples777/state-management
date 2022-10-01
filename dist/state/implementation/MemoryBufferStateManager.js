import debug from 'debug';
import { AbstractStateManager } from './AbstractStateManager';
import { StateEventType } from "../interface/StateManager";
const msManager = debug('state-manager-ms');
/** To Do - make state unchangeable outside of this class (i.e. deep copies) */
export class MemoryBufferStateManager extends AbstractStateManager {
    constructor(defaultEq, equalFns = null) {
        super('memory', defaultEq, equalFns);
        this.applicationState = [];
        this.forceSaves = true;
    }
    fireStateChangedForAllStates() {
        if (this.isEmittingEvents()) {
            this.applicationState.forEach((state) => {
                this.delegate.informChangeListenersForStateWithName(state.name, state.value, StateEventType.StateChanged, null);
            });
        }
    }
    _ensureStatePresent(name) {
        let foundIndex = this.applicationState.findIndex(element => element.name === name);
        if (foundIndex < 0) {
            let state = {
                name: name,
                value: [],
                hasBeenSet: false
            };
            this.applicationState.push(state);
        }
    }
    _addNewNamedStateToStorage(state) {
        msManager(`Adding new complete state ${name}`);
        msManager(state.value);
        this.applicationState.push(state);
    }
    _replaceNamedStateInStorage(state) {
        let foundIndex = this.applicationState.findIndex(element => element.name === state.name);
        if (foundIndex >= 0) {
            msManager(`replacing complete state ${name}`);
            msManager(state.value);
            this.applicationState.splice(foundIndex, 1, state);
        }
    }
    _getState(name) {
        this._ensureStatePresent(name);
        // @ts-ignore
        let state = this.applicationState.find(element => element.name === name);
        msManager(`getting complete state ${name}`);
        msManager(state.value);
        return state;
    }
    _saveState(name, stateObject) {
        let foundIndex = this.applicationState.findIndex(element => element.name === name);
        if (foundIndex >= 0) {
            let state = this.applicationState[foundIndex];
            msManager(`SAVING complete state ${name}`);
            msManager(state.value);
            state.value = stateObject;
        }
    }
    _addItemToState(name, stateObj, isPersisted = false) {
        if (!isPersisted)
            return; // dont add incomplete objects to the state
        let foundIndex = this.applicationState.findIndex(element => element.name === name);
        if (foundIndex >= 0) {
            let state = this.applicationState[foundIndex];
            msManager(`adding item to state ${name}`);
            msManager(stateObj);
            const valueIndex = state.value.findIndex((element) => this.getEqualityFnForName(name)(element, stateObj));
            if (valueIndex >= 0) {
                state.value.splice(valueIndex, 1, stateObj);
                msManager(`item was already in state, updating instead ${name}`);
            }
            else {
                state.value.push(stateObj);
            }
        }
    }
    _removeItemFromState(name, stateObj, isPersisted) {
        let foundIndex = this.applicationState.findIndex(element => element.name === name);
        if (foundIndex >= 0) {
            let state = this.applicationState[foundIndex];
            const valueIndex = state.value.findIndex((element) => this.getEqualityFnForName(name)(element, stateObj));
            if (valueIndex >= 0) {
                msManager(`removing item from state ${name}`);
                msManager(stateObj);
                state.value.splice(valueIndex, 1);
            }
        }
    }
    _updateItemInState(name, stateObj, isPersisted) {
        let foundIndex = this.applicationState.findIndex(element => element.name === name);
        if (foundIndex >= 0) {
            let state = this.applicationState[foundIndex];
            const valueIndex = state.value.findIndex((element) => this.getEqualityFnForName(name)(element, stateObj));
            if (valueIndex >= 0) {
                state.value.splice(valueIndex, 1, stateObj);
                msManager(`updating item in state ${name}`);
                msManager(stateObj);
            }
        }
        else {
            this._addItemToState(name, stateObj, true);
        }
    }
    getAvailableStateNames() {
        let result = [];
        this.applicationState.forEach((state) => {
            result.push(state.name);
        });
        return result;
    }
}
//# sourceMappingURL=MemoryBufferStateManager.js.map