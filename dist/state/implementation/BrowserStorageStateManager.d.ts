import { AbstractStateManager, EqualityFnForName } from "./AbstractStateManager";
import { StateValue } from "../interface/StateManager";
import { AsynchronousStateManager } from "../interface/AsynchronousStateManager";
import { equalityFunction } from "../../CommonTypes";
export declare class BrowserStorageStateManager extends AbstractStateManager implements AsynchronousStateManager {
    protected storage: Storage;
    protected allowPersistence: boolean;
    protected configuration: string[];
    protected initialised: boolean;
    constructor(useLocalStorage: boolean | undefined, allowPersistence: boolean | undefined, defaultEq: equalityFunction, equalFns?: EqualityFnForName[] | null);
    isInitialised(): boolean;
    setInitialised(): void;
    setCompletedRun(stateName: string): void;
    _ensureStatePresent(name: string): void;
    _addNewNamedStateToStorage(state: StateValue): void;
    _replaceNamedStateInStorage(state: StateValue): void;
    _getState(name: string): StateValue;
    _saveState(name: string, newValue: any): void;
    _addItemToState(name: string, stateObj: any, isPersisted?: boolean): void;
    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void;
    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void;
    forceResetForGet(stateName: string): void;
    getConfiguredStateNames(): string[];
    hasCompletedRun(stateName: string): boolean;
    initialise(config: string[]): void;
    fireStateChangedForAllStates(): void;
    getAvailableStateNames(): string[];
}
