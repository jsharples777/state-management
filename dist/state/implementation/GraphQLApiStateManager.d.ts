import { StateValue } from "../interface/StateManager";
import { FilterItem } from "../../CommonTypes";
import { AbstractAsynchronousStateManager } from "./AbstractAsynchronousStateManager";
export declare type QLConfig = {
    stateName: string;
    serverURL: string;
    apiURL: string;
    apis: {
        findAll: string;
        create: string;
        destroy: string;
        update: string;
        find: string;
    };
    data: {
        findAll: string;
        create: string;
        destroy: string;
        update: string;
        find: string;
    };
    isActive: boolean;
    idField?: string;
};
export declare class GraphQLApiStateManager extends AbstractAsynchronousStateManager {
    private static _instance;
    private static FUNCTION_ID_ADD_ITEM;
    private static FUNCTION_ID_REMOVE_ITEM;
    private static FUNCTION_ID_UPDATE_ITEM;
    private static FUNCTION_ID_GET_ITEMS;
    private static FUNCTION_ID_FIND_ITEM;
    protected configuration: QLConfig[];
    private functionIdAddItem;
    private functionIdRemoveItem;
    private functionIdUpdateItem;
    private functionIdGetItems;
    private functionIdFindItem;
    constructor(id: string);
    static getInstance(): GraphQLApiStateManager;
    initialise(configs: QLConfig[]): void;
    addConfig(config: QLConfig): void;
    _addNewNamedStateToStorage(state: StateValue): void;
    _getState(name: string): StateValue;
    _ensureStatePresent(name: string): void;
    _replaceNamedStateInStorage(state: StateValue): void;
    _saveState(name: string, stateObj: any): void;
    _addItemToState(name: string, stateObj: any, isPersisted?: boolean): void;
    _findItemInState(name: string, stateObj: any): void;
    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void;
    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void;
    _findItemsInState(name: string, filters: FilterItem[]): any[];
    protected getConfigurationForStateName(name: string): QLConfig;
    private callbackForRemoveItem;
    private callbackForUpdateItem;
    private callbackForGetItems;
    private callbackForAddItem;
    private callbackForFindItem;
}
