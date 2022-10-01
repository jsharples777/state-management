import { StateValue } from "../interface/StateManager";
import { AbstractStateManager, EqualityFnForName } from "./AbstractStateManager";
import { equalityFunction, FilterItem } from "../../CommonTypes";
export declare class AggregateStateManager extends AbstractStateManager {
    private stateManagers;
    constructor(defaultEq: equalityFunction, equalityFns?: EqualityFnForName[] | null);
    getAvailableStateNames(): string[];
    fireStateChangedForAllStates(): void;
    addStateManager(stateManager: AbstractStateManager, filters: string[] | undefined, emitEvents: boolean): void;
    _addNewNamedStateToStorage(state: StateValue): void;
    _getState(name: string): StateValue;
    _ensureStatePresent(name: string): void;
    _replaceNamedStateInStorage(state: StateValue): void;
    _saveState(name: string, stateObj: any): void;
    _addItemToState(name: string, stateObj: any, isPersisted?: boolean): void;
    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void;
    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void;
    _findItemsInState(name: string, filters: FilterItem[]): any[];
    _findItemInState(name: string, item: any): any;
    private stateNameInFilters;
}
