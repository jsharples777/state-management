import {AsynchronousStateManager} from "../interface/AsynchronousStateManager";
import {FilterItem} from "../../CommonTypes";
import {StateEventType, StateManagerType, StateValue} from "../interface/StateManager";
import {StateContextSupplier} from "../interface/StateContextSupplier";
import {StateChangeListener} from "../interface/StateChangeListener";
import {StateChangeInformer} from "../interface/StateChangeInformer";
import {StateContextDelegate} from "../delegate/StateContextDelegate";
import {StateChangedDelegate} from "../delegate/StateChangedDelegate";
import debug from "debug";

const logger = debug('abstract-async-state-manager');

export abstract class AbstractAsynchronousStateManager implements AsynchronousStateManager {
    protected bHasCompletedRun: boolean[];
    protected bIsRunInProgress: boolean[];
    protected delegate: StateChangeInformer;
    protected contextDelegate: StateContextDelegate | null = null;
    protected managerName: string;
    protected stateBuffers: StateValue[];
    protected initialised: boolean = false;

    public constructor(id: string, managerName: string) {
        this.delegate = new StateChangedDelegate(managerName);
        this.emitEvents();
        this.bHasCompletedRun = [];
        this.bIsRunInProgress = [];
        this.managerName = managerName;
        this.stateBuffers = [];
    }

    abstract _addItemToState(name: string, stateObj: any, isPersisted: boolean): void;

    abstract _addNewNamedStateToStorage(state: StateValue): void;

    abstract _ensureStatePresent(name: string): void ;

    abstract _findItemInState(name: string, item: any): any ;

    abstract _findItemsInState(name: string, filters: FilterItem[]): any[];

    abstract _getState(name: string): StateValue ;

    abstract _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void ;

    abstract _replaceNamedStateInStorage(state: StateValue): void ;

    abstract _saveState(name: string, stateObj: any): void ;

    abstract _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void ;

    addChangeListenerForName(name: string, listener: StateChangeListener): void {
        this.delegate.addChangeListenerForName(name, listener);
        /* have we already completed the run for the state? */
        if (this.hasCompletedRun(name)) {
            let foundIndex = this.stateBuffers.findIndex(element => element.name === name);
            if (foundIndex >= 0) {
                let state: StateValue = this.stateBuffers[foundIndex];
                listener.stateChanged(this.managerName, name, state.value);
            }

        }
    }

    addStateNameToConfigurations(stateName: string) {
        let state: StateValue = {
            name: stateName,
            value: [],
            hasBeenSet: false
        }
        this.stateBuffers.push(state);
        this.bIsRunInProgress.push(false);
        this.bHasCompletedRun.push(false);
    }

    forceResetForGet(stateName: string): void {
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            this.bHasCompletedRun[foundIndex] = false;
            this.bIsRunInProgress[foundIndex] = false;
        }
    }

    getConfiguredStateNames(): string[] {
        let results: string[] = [];
        this.stateBuffers.forEach((config) => {
            results.push(config.name);
        });
        return results;
    }

    hasCompletedRun(stateName: string): boolean {
        let result = false;
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            result = this.bHasCompletedRun[foundIndex];
        }
        return result;
    }

    setCompletedRun(stateName: string, values: any[]): void {
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            this.bHasCompletedRun[foundIndex] = true;
            this.bIsRunInProgress[foundIndex] = false;
            this.stateBuffers[foundIndex].value = values;
        }
    }

    isRunInProgress(stateName: string): boolean {
        let result = false;
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            result = this.bIsRunInProgress[foundIndex];
        }
        return result;
    }

    setRunInProgress(stateName: string,): void {
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            this.bIsRunInProgress[foundIndex] = true;
        }
    }

    clearRunInProgress(stateName: string,): void {
        let foundIndex = this.stateBuffers.findIndex((config) => config.name === stateName);
        if (foundIndex >= 0) {
            this.bIsRunInProgress[foundIndex] = false;
        }
    }

    setContextSupplier(name: string, supplier: StateContextSupplier): void {
        this.contextDelegate = new StateContextDelegate(this, name, supplier);
    }

    stateContextChanged(newContext: any): void {
    }

    addNewItemToState(name: string, item: any, isPersisted: boolean): void {
        this._addItemToState(name, item, isPersisted);
    }

    emitEvents(): void {
        this.delegate.emitEvents();
    }

    findItemInState(name: string, item: any): any {
        return this._findItemInState(name, item);
    }

    getStateByName(name: string): any {
        let result: any[] = [];
        if (this.isRunInProgress(name)) {
            logger(`Getting state for name ${name} in progress`);
            return [];
        } else if (this.hasCompletedRun(name)) {
            logger(`Getting state for name ${name} has already completed`);
            let foundIndex = this.stateBuffers.findIndex(element => element.name === name);
            if (foundIndex >= 0) {
                let state: StateValue = this.stateBuffers[foundIndex];
                result = state.value;
            }

        } else {
            this._getState(name);
        }
        return result;
    }

    informChangeListenersForStateWithName(name: string, stateObjValue: any, eventType: StateEventType, previousObjValue: any): void {
        this.delegate.informChangeListenersForStateWithName(name, stateObjValue, eventType, previousObjValue);
    }

    isItemInState(name: string, item: any): boolean {
        return true;
    }

    removeItemFromState(name: string, item: any, isPersisted: boolean): boolean {
        logger(`Removing item from state ${name} is persisted ${isPersisted}`);
        logger(item);
        this._removeItemFromState(name, item, isPersisted);
        return true;
    }

    setStateByName(name: string, stateObjectForName: any, informListeners: boolean): void {
        // state supplied from elsewhere, set run completed

    }

    suppressEvents(): void {
        this.delegate.suppressEvents();
    }

    updateItemInState(name: string, item: any, isPersisted: boolean): boolean {
        this._updateItemInState(name, item, isPersisted);
        return true;
    }

    findItemsInState(name: string, filters: FilterItem[]): any[] {
        return this._findItemsInState(name, filters);
    }

    getType(): StateManagerType {
        return StateManagerType.AsyncRemote;
    }

    fireStateChanged(name: string): void {
        if (this.isEmittingEvents()) {
            let foundIndex = this.stateBuffers.findIndex((config) => config.name === name);
            if (foundIndex >= 0) {
                const state = this.stateBuffers[foundIndex];
                this.delegate.informChangeListenersForStateWithName(name, state.value, StateEventType.StateChanged, null);
            }
        }
    }

    fireStateChangedForAllStates(): void {
        if (this.isEmittingEvents()) {
            this.stateBuffers.forEach((state) => {
                this.delegate.informChangeListenersForStateWithName(state.name, state.value, StateEventType.StateChanged, null);
            });
        }
    }

    isEmittingEvents(): boolean {
        return this.delegate.isEmittingEvents();
    }

    getAvailableStateNames(): string[] {
        return this.getConfiguredStateNames();
    }

    isInitialised(): boolean {
        return this.initialised;
    }

    setInitialised(): void {
        this.initialised = true;
    }

    protected postInitialise() {

    }
}
