import { AsynchronousStateManager } from "../interface/AsynchronousStateManager";
import { FilterItem } from "../../CommonTypes";
import { StateEventType, StateManagerType, StateValue } from "../interface/StateManager";
import { StateContextSupplier } from "../interface/StateContextSupplier";
import { StateChangeListener } from "../interface/StateChangeListener";
import { StateChangeInformer } from "../interface/StateChangeInformer";
import { StateContextDelegate } from "../delegate/StateContextDelegate";
export declare abstract class AbstractAsynchronousStateManager implements AsynchronousStateManager {
    protected bHasCompletedRun: boolean[];
    protected bIsRunInProgress: boolean[];
    protected delegate: StateChangeInformer;
    protected contextDelegate: StateContextDelegate | null;
    protected managerName: string;
    protected stateBuffers: StateValue[];
    protected initialised: boolean;
    constructor(id: string, managerName: string);
    abstract _addItemToState(name: string, stateObj: any, isPersisted: boolean): void;
    abstract _addNewNamedStateToStorage(state: StateValue): void;
    abstract _ensureStatePresent(name: string): void;
    abstract _findItemInState(name: string, item: any): any;
    abstract _findItemsInState(name: string, filters: FilterItem[]): any[];
    abstract _getState(name: string): StateValue;
    abstract _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void;
    abstract _replaceNamedStateInStorage(state: StateValue): void;
    abstract _saveState(name: string, stateObj: any): void;
    abstract _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void;
    addChangeListenerForName(name: string, listener: StateChangeListener): void;
    addStateNameToConfigurations(stateName: string): void;
    forceResetForGet(stateName: string): void;
    getConfiguredStateNames(): string[];
    hasCompletedRun(stateName: string): boolean;
    setCompletedRun(stateName: string, values: any[]): void;
    isRunInProgress(stateName: string): boolean;
    setRunInProgress(stateName: string): void;
    clearRunInProgress(stateName: string): void;
    setContextSupplier(name: string, supplier: StateContextSupplier): void;
    stateContextChanged(newContext: any): void;
    addNewItemToState(name: string, item: any, isPersisted: boolean): void;
    emitEvents(): void;
    findItemInState(name: string, item: any): any;
    getStateByName(name: string): any;
    informChangeListenersForStateWithName(name: string, stateObjValue: any, eventType: StateEventType, previousObjValue: any): void;
    isItemInState(name: string, item: any): boolean;
    removeItemFromState(name: string, item: any, isPersisted: boolean): boolean;
    setStateByName(name: string, stateObjectForName: any, informListeners: boolean): void;
    suppressEvents(): void;
    updateItemInState(name: string, item: any, isPersisted: boolean): boolean;
    findItemsInState(name: string, filters: FilterItem[]): any[];
    getType(): StateManagerType;
    fireStateChanged(name: string): void;
    fireStateChangedForAllStates(): void;
    isEmittingEvents(): boolean;
    getAvailableStateNames(): string[];
    isInitialised(): boolean;
    setInitialised(): void;
    protected postInitialise(): void;
}
