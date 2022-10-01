import { StateValue } from "../interface/StateManager";
import { AsynchronousStateManager } from "../interface/AsynchronousStateManager";
import { BrowserStorageStateManager } from "./BrowserStorageStateManager";
import { equalityFunction } from "../../CommonTypes";
import { EqualityFnForName } from "./AbstractStateManager";
export declare class EncryptedBrowserStorageStateManager extends BrowserStorageStateManager implements AsynchronousStateManager {
    constructor(useLocalStorage: boolean | undefined, defaultEq: equalityFunction, equalFns?: EqualityFnForName[] | null);
    _addNewNamedStateToStorage(state: StateValue): void;
    _getState(name: string): StateValue;
}
