import { StateValue } from "../interface/StateManager";
import { FilterItem } from "../../CommonTypes";
import { AbstractAsynchronousStateManager } from "./AbstractAsynchronousStateManager";
export declare type ApiConfig = {
    stateName: string;
    serverURL: string;
    api: string;
    isActive: boolean;
    idField?: string;
    findAll: boolean;
    create: boolean;
    update: boolean;
    destroy: boolean;
    find: boolean;
    lastModified: boolean;
    lastModifiedField?: string;
};
export declare class RESTApiStateManager extends AbstractAsynchronousStateManager {
    private static _instance;
    private static FUNCTION_ID_ADD_ITEM;
    private static FUNCTION_ID_REMOVE_ITEM;
    private static FUNCTION_ID_UPDATE_ITEM;
    private static FUNCTION_ID_GET_ITEMS;
    private static FUNCTION_ID_FIND_ITEM;
    private static FUNCTION_ID_GET_LAST_MODIFIED_ITEM;
    protected configuration: ApiConfig[];
    private functionIdAddItem;
    private functionIdRemoveItem;
    private functionIdUpdateItem;
    private functionIdGetItems;
    private functionIdFindItem;
    private functionIdLastModifiedItem;
    constructor(id: string);
    static getInstance(): RESTApiStateManager;
    initialise(configs: ApiConfig[]): void;
    addConfig(config: ApiConfig): void;
    addConfigByStateNameAndApi(stateName: string, api: string, idField?: string): void;
    _addNewNamedStateToStorage(state: StateValue): void;
    _getState(name: string): StateValue;
    _ensureStatePresent(name: string): void;
    _replaceNamedStateInStorage(state: StateValue): void;
    _saveState(name: string, stateObj: any): void;
    _addItemToState(name: string, stateObj: any, isPersisted?: boolean): void;
    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void;
    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void;
    _findItemsInState(name: string, filters: FilterItem[]): any[];
    private _getLastModifiedForItem;
    private _findItemInStateNoCheck;
    _findItemInState(name: string, item: any): any;
    protected getConfigurationForStateName(name: string): ApiConfig;
    private callbackForRemoveItem;
    private callbackForUpdateItem;
    private callbackForGetItems;
    private callbackForFindItem;
    private callbackForModifiedItem;
    private callbackForAddItem;
}
