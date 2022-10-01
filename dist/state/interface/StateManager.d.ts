import { StateChangeInformer } from "./StateChangeInformer";
import { StateChangeListener } from "./StateChangeListener";
import { FilterItem } from "../../CommonTypes";
import { StateContextListener } from "./StateContextListener";
import { StateContextSupplier } from "./StateContextSupplier";
export declare type StateValue = {
    name: string;
    value: any;
    hasBeenSet: boolean;
};
export declare type stateListeners = {
    name: string;
    listeners: StateChangeListener[];
};
export declare enum StateEventType {
    ItemAdded = 0,
    ItemUpdated = 1,
    ItemDeleted = 2,
    StateChanged = 3,
    FilterResults = 4,
    FindItem = 5
}
export declare enum StateManagerType {
    Local = 0,
    AsyncLocal = 1,
    AsyncRemote = 2
}
export interface StateManager extends StateChangeInformer, StateContextListener {
    setContextSupplier(name: string, supplier: StateContextSupplier): void;
    getType(): StateManagerType;
    getStateByName(name: string): any;
    setStateByName(name: string, stateObjectForName: any, informListeners: boolean): void;
    addNewItemToState(name: string, item: any, isPersisted: boolean): void;
    findItemInState(name: string, item: any): any;
    findItemsInState(name: string, filters: FilterItem[]): any[];
    isItemInState(name: string, item: any): boolean;
    removeItemFromState(name: string, item: any, isPersisted: boolean): boolean;
    updateItemInState(name: string, item: any, isPersisted: boolean): boolean;
    getAvailableStateNames(): string[];
    fireStateChanged(name: string): void;
    fireStateChangedForAllStates(): void;
    _addNewNamedStateToStorage(state: StateValue): void;
    _getState(name: string): StateValue;
    _ensureStatePresent(name: string): void;
    _replaceNamedStateInStorage(state: StateValue): void;
    _saveState(name: string, stateObj: any): void;
    _addItemToState(name: string, stateObj: any, isPersisted: boolean): void;
    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void;
    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void;
    _findItemsInState(name: string, filters: FilterItem[]): any[];
    _findItemInState(name: string, item: any): any;
}
