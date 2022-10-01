import debug from 'debug';

import {AbstractStateManager, EqualityFnForName} from "./AbstractStateManager";
import {StateValue} from "../interface/StateManager";
import {AsynchronousStateManager} from "../interface/AsynchronousStateManager";
import {equalityFunction} from "../../CommonTypes";

const lsLogger = debug('browser-storage');

export class BrowserStorageStateManager extends AbstractStateManager implements AsynchronousStateManager {

    protected storage: Storage;
    protected allowPersistence: boolean;
    // @ts-ignore
    protected configuration: string[] = [];
    protected initialised: boolean = false;

    public constructor(useLocalStorage: boolean = false, allowPersistence: boolean = false, defaultEq: equalityFunction, equalFns: EqualityFnForName[] | null = null) {
        super('browser', defaultEq, equalFns);
        this.storage = window.sessionStorage;
        this.allowPersistence = allowPersistence;
        if (useLocalStorage) this.storage = window.localStorage;
        this.forceSaves = true;
    }

    isInitialised(): boolean {
        return this.initialised;
    }

    setInitialised(): void {
        this.initialised = true;
    }

    setCompletedRun(stateName: string): void {

    }

    public _ensureStatePresent(name: string): void {
        if (this.storage.getItem(name) === null) {
            this._addNewNamedStateToStorage({name: name, value: [], hasBeenSet: false});
        }
    }

    public _addNewNamedStateToStorage(state: StateValue): void {
        lsLogger(`Local Storage: Saving with key ${state.name}`);
        lsLogger(state);
        const stringifiedSaveData: string = JSON.stringify(state.value);
        lsLogger(stringifiedSaveData);
        this.storage.setItem(state.name, stringifiedSaveData);

    }

    public _replaceNamedStateInStorage(state: StateValue): void {
        this._addNewNamedStateToStorage(state);
    }

    public _getState(name: string): StateValue {
        let state: StateValue = {
            name: name,
            value: [],
            hasBeenSet: false
        }
        lsLogger(`Local Storage: Loading with key ${name}`);
        const savedResultsJSON = this.storage.getItem(name);
        lsLogger(savedResultsJSON);
        if (savedResultsJSON !== null) {
            state.value = JSON.parse(savedResultsJSON);
            state.hasBeenSet = true;
        }
        return state;
    }

    public _saveState(name: string, newValue: any): void {
        this._addNewNamedStateToStorage({name: name, value: newValue, hasBeenSet: true});
    }

    _addItemToState(name: string, stateObj: any, isPersisted: boolean = false): void {
        if (!isPersisted) {
            if (!this.allowPersistence) {
                return;
            }
        }

        let state: StateValue = this._getState(name);
        lsLogger(`adding item to state ${name}`);
        lsLogger(stateObj);
        const valueIndex = state.value.findIndex((element: any) => this.getEqualityFnForName(name)(element, stateObj));
        if (valueIndex >= 0) {
            state.value.splice(valueIndex, 1, stateObj);
            lsLogger(`item was already in state, updating instead ${name}`);
        } else {
            state.value.push(stateObj);
        }
        this._replaceNamedStateInStorage(state);
    }

    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void {
        let state: StateValue = this._getState(name);
        const valueIndex = state.value.findIndex((element: any) => this.getEqualityFnForName(name)(element, stateObj));
        if (valueIndex >= 0) {
            lsLogger(`removing item from state ${name}`);
            lsLogger(stateObj);
            state.value.splice(valueIndex, 1);
        }
        this._replaceNamedStateInStorage(state);
    }

    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void {
        let state: StateValue = this._getState(name);
        const valueIndex = state.value.findIndex((element: any) => this.getEqualityFnForName(name)(element, stateObj));
        if (valueIndex >= 0) {
            state.value.splice(valueIndex, 1, stateObj);
            lsLogger(`updating item in state ${name}`);
            lsLogger(stateObj);
        }
        this._replaceNamedStateInStorage(state);
    }

    forceResetForGet(stateName: string): void {
    }

    getConfiguredStateNames(): string[] {
        return this.configuration;
    }

    hasCompletedRun(stateName: string): boolean {
        return false;
    }

    public initialise(config: string[]) {
        this.configuration = config;
        this.initialised = true;
    }

    fireStateChangedForAllStates(): void {
        if (this.isEmittingEvents()) {
            const stateNames = this.getConfiguredStateNames();
            stateNames.forEach((name) => {
                const state = this._getState(name);
                this.informChangeListenersForStateWithName(name, state.value);
            })

        }
    }

    getAvailableStateNames(): string[] {
        return this.getConfiguredStateNames();
    }

}
