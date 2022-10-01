import { AbstractStateManager, EqualityFnForName } from './AbstractStateManager';
import { StateValue } from "../interface/StateManager";
import { equalityFunction } from "../../CommonTypes";
/** To Do - make state unchangeable outside of this class (i.e. deep copies) */
export declare class MemoryBufferStateManager extends AbstractStateManager {
    private static _instance;
    protected applicationState: StateValue[];
    constructor(defaultEq: equalityFunction, equalFns?: EqualityFnForName[] | null);
    fireStateChangedForAllStates(): void;
    _ensureStatePresent(name: string): void;
    _addNewNamedStateToStorage(state: StateValue): void;
    _replaceNamedStateInStorage(state: StateValue): void;
    _getState(name: string): StateValue;
    _saveState(name: string, stateObject: any): void;
    _addItemToState(name: string, stateObj: any, isPersisted?: boolean): void;
    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void;
    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void;
    getAvailableStateNames(): string[];
}
