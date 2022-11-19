import {StateEventType, StateValue} from "../interface/StateManager";
import {JSONRequest, RequestType} from "../../network/Types";
import {DownloadManager} from "../../network/DownloadManager";
import debug from 'debug';
import {CallbackRegistry} from "../../network/CallbackRegistry";
import {FilterItem} from "../../CommonTypes";
import {AbstractAsynchronousStateManager} from "./AbstractAsynchronousStateManager";
import {GlobalContextSupplier} from "../helper/GlobalContextSupplier";
import {
    FIELD_CreatedBy,
    FIELD_CreatedOn,
    FIELD_ModifiedBy,
    FIELD_ModifiedOn
} from "../../model/BasicObjectDefinitionFactory";
import moment from "moment";
import {SecurityManager} from "../../security/SecurityManager";


const logger = debug('state-manager-api');

export type ApiConfig = {
    stateName: string,
    serverURL: string,
    api: string
    isActive: boolean,
    idField?: string,
    findAll: boolean,
    create: boolean,
    update: boolean,
    destroy: boolean,
    find: boolean,
    lastModified: boolean,
    lastModifiedField?:string
}

export class RESTApiStateManager extends AbstractAsynchronousStateManager {
    private static _instance: RESTApiStateManager;
    private static FUNCTION_ID_ADD_ITEM = 'rest.api.state.manager.add.item';
    private static FUNCTION_ID_REMOVE_ITEM = 'rest.api.state.manager.remove.item';
    private static FUNCTION_ID_UPDATE_ITEM = 'rest.api.state.manager.update.item';
    private static FUNCTION_ID_GET_ITEMS = 'rest.api.state.manager.get.items';
    private static FUNCTION_ID_FIND_ITEM = 'rest.api.state.manager.find.item';
    private static FUNCTION_ID_GET_LAST_MODIFIED_ITEM = 'rest.api.state.manager.get.last.modified.item';

    protected configuration: ApiConfig[] = [];


    private functionIdAddItem: string;
    private functionIdRemoveItem: string;
    private functionIdUpdateItem: string;
    private functionIdGetItems: string;
    private functionIdFindItem: string;
    private functionIdLastModifiedItem: string;

    public constructor(id: string) {
        super(id, 'restapi');

        this.callbackForAddItem = this.callbackForAddItem.bind(this);
        this.callbackForRemoveItem = this.callbackForRemoveItem.bind(this);
        this.callbackForUpdateItem = this.callbackForUpdateItem.bind(this);
        this.callbackForGetItems = this.callbackForGetItems.bind(this);
        this.callbackForFindItem = this.callbackForFindItem.bind(this);
        this.callbackForModifiedItem = this.callbackForModifiedItem.bind(this);

        // function ids
        this.functionIdAddItem = RESTApiStateManager.FUNCTION_ID_ADD_ITEM + id;
        this.functionIdRemoveItem = RESTApiStateManager.FUNCTION_ID_REMOVE_ITEM + id;
        this.functionIdUpdateItem = RESTApiStateManager.FUNCTION_ID_UPDATE_ITEM + id;
        this.functionIdGetItems = RESTApiStateManager.FUNCTION_ID_GET_ITEMS + id;
        this.functionIdFindItem = RESTApiStateManager.FUNCTION_ID_FIND_ITEM + id;
        this.functionIdLastModifiedItem = RESTApiStateManager.FUNCTION_ID_GET_LAST_MODIFIED_ITEM + id;

        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdAddItem, this.callbackForAddItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdRemoveItem, this.callbackForRemoveItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdUpdateItem, this.callbackForUpdateItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdGetItems, this.callbackForGetItems);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdFindItem, this.callbackForFindItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdLastModifiedItem, this.callbackForModifiedItem);
    }


    public static getInstance() {
        if (!(RESTApiStateManager._instance)) {
            RESTApiStateManager._instance = new RESTApiStateManager("1");
        }
        return RESTApiStateManager._instance;
    }


    public initialise(configs: ApiConfig[]) {
        configs.forEach((config) => {
            this.addConfig(config);
        })

        this.initialised = true;
    }

    public addConfig(config: ApiConfig): void {
        this.configuration.push(config);
        this.addStateNameToConfigurations(config.stateName);
        this.initialised = true;
    }

    public addConfigByStateNameAndApi(stateName: string, api: string, idField: string = '_id') {
        let config: ApiConfig = {
            stateName: stateName,
            serverURL: '',
            api: api,
            isActive: true,
            idField: idField,
            find: true,
            findAll: true,
            create: true,
            update: true,
            destroy: true,
            lastModified:false
        }
    }

    _addNewNamedStateToStorage(state: StateValue): void { /* assume model on the other end exists */
    }

    _getState(name: string): StateValue {
        logger(`Getting All ${name}`);
        if (this.hasCompletedRun(name)) {
            logger(`Getting All ${name} - not done - previously retrieved`);
        } else {
            if (!this.isRunInProgress(name)) {
                this.setRunInProgress(name);
                let config: ApiConfig = this.getConfigurationForStateName(name);
                if (config.isActive && config.findAll) {
                    const jsonRequest: JSONRequest = {
                        url: config.serverURL + config.api,
                        type: RequestType.GET,
                        params: {},
                        callbackId: this.functionIdGetItems,
                        associatedStateName: name
                    };
                    if (this.contextDelegate) {
                        jsonRequest.context = this.contextDelegate.getContextForApi();
                    }
                    else {
                        jsonRequest.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
                    }
                    DownloadManager.getInstance().addApiRequest(jsonRequest, true);

                } else {
                    logger(`No configuration for state ${name}`);
                }
            }
        }
        let state: StateValue = {name: name, value: [], hasBeenSet: false};
        return state;
    }

    _ensureStatePresent(name: string): void { /* assume state exists */
    }

    _replaceNamedStateInStorage(state: StateValue): void { /* not going to replace all state */
    }

    _saveState(name: string, stateObj: any): void { /* not going to replace all state */
    }

    _addItemToState(name: string, stateObj: any, isPersisted: boolean = false): void {
        if (isPersisted) return; // dont add complete objects to the state - they are already processed
        logger(`Adding item to ${name}`);
        logger(stateObj);
        let config: ApiConfig = this.getConfigurationForStateName(name);
        if (config.isActive && config.create) {

            if (config.lastModified) {
                const now = parseInt(moment().format('YYYYMMDDHHmmss'));
                stateObj[FIELD_ModifiedOn] = now;
                stateObj[FIELD_CreatedOn] = now;
                stateObj[FIELD_ModifiedBy] = SecurityManager.getInstance().getLoggedInUsername();
                stateObj[FIELD_CreatedBy] = SecurityManager.getInstance().getLoggedInUsername();
            }

            const jsonRequest: JSONRequest = {
                url: config.serverURL + config.api,
                type: RequestType.POST,
                params: stateObj,
                callbackId: this.functionIdAddItem,
                associatedStateName: name
            };
            if (this.contextDelegate) {
                jsonRequest.context = this.contextDelegate.getContextForApi();
            }
            else {
                jsonRequest.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addApiRequest(jsonRequest, true);

        } else {
            logger(`No configuration for state ${name}`);
        }
    }

    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void {
        if (isPersisted) return; // dont remove complete objects to the state - they are already processed
        logger(`Removing item from ${name}`);
        logger(stateObj);
        let config: ApiConfig = this.getConfigurationForStateName(name);
        let identifier = stateObj.id;
        if (config.idField) {
            identifier = stateObj[config.idField];
        }

        if (config.isActive && config.destroy) {
            const jsonRequest: JSONRequest = {
                url: config.serverURL + config.api,
                type: RequestType.DELETE,
                params: {
                    id: identifier
                },
                callbackId: this.functionIdRemoveItem,
                associatedStateName: name
            };
            if (this.contextDelegate) {
                jsonRequest.context = this.contextDelegate.getContextForApi();
            }
            else {
                jsonRequest.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addApiRequest(jsonRequest, true);

        } else {
            logger(`No configuration for state ${name}`);
        }
    }

    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void {
        if (isPersisted) return; // dont update complete objects to the state - they are already processed
        logger(`Updating item in ${name}`);
        logger(stateObj);
        let config: ApiConfig = this.getConfigurationForStateName(name);
        if (config.isActive && config.update) {

            if (config.lastModified) {
                const now = parseInt(moment().format('YYYYMMDDHHmmss'));
                stateObj[FIELD_ModifiedOn] = now;
                stateObj[FIELD_ModifiedBy] = SecurityManager.getInstance().getLoggedInUsername();
            }

            const jsonRequest: JSONRequest = {
                url: config.serverURL + config.api,
                type: RequestType.PUT,
                params: stateObj,
                callbackId: this.functionIdUpdateItem,
                associatedStateName: name
            };
            if (this.contextDelegate) {
                jsonRequest.context = this.contextDelegate.getContextForApi();
            }
            else {
                jsonRequest.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addApiRequest(jsonRequest, true);

        } else {
            logger(`No configuration for state ${name}`);
        }
    }


    _findItemsInState(name: string, filters: FilterItem[]): any[] {
        // TO DO
        return [];
    }

    private _getLastModifiedForItem(name: string, item: any): any {
        logger(`Getting Last Modified item from ${name}`);
        logger(item);
        let config: ApiConfig = this.getConfigurationForStateName(name);
        let identifier = item.id;
        if (config.idField) {
            identifier = item[config.idField];
        }
        let lastModifiedOn = item[FIELD_ModifiedOn];
        if (config.lastModifiedField) {
            lastModifiedOn = item[config.lastModifiedField];
        }

        if (config.isActive && config.lastModified) {
            const jsonRequest: JSONRequest = {
                url: config.serverURL + config.api,
                type: RequestType.PATCH,
                params: {
                    id: identifier,
                    modified: lastModifiedOn
                },
                callbackId: this.functionIdLastModifiedItem,
                associatedStateName: name
            };
            if (this.contextDelegate) {
                jsonRequest.context = this.contextDelegate.getContextForApi();
            }
            else {
                jsonRequest.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addApiRequest(jsonRequest, true);

        } else {
            logger(`No configuration for state ${name}`);
        }
    }

    private _findItemInStateNoCheck(name: string, item: any): any {
        logger(`Finding item from ${name}`);
        logger(item);
        let config: ApiConfig = this.getConfigurationForStateName(name);
        let identifier = item.id;
        if (config.idField) {
            identifier = item[config.idField];
        }
        const jsonRequest: JSONRequest = {
            url: config.serverURL + config.api,
            type: RequestType.GET,
            params: {
                id: identifier
            },
            callbackId: this.functionIdFindItem,
            associatedStateName: name
        };
        if (this.contextDelegate) {
            jsonRequest.context = this.contextDelegate.getContextForApi();
        }
        else {
            jsonRequest.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
        }
        DownloadManager.getInstance().addApiRequest(jsonRequest, true);

    }


    _findItemInState(name: string, item: any): any {
        logger(`Finding item from ${name}`);
        logger(item);
        let config: ApiConfig = this.getConfigurationForStateName(name);

        if (config.isActive && config.lastModified) {
            this._getLastModifiedForItem(name,item);
        }
        else if (config.isActive && config.find) {
            this._findItemInStateNoCheck(name, item);
        } else {
            logger(`No configuration for state ${name}`);
        }
    }

    protected getConfigurationForStateName(name: string) {
        let config: ApiConfig = {
            stateName: name,
            serverURL: '',
            api: '',
            isActive: false,
            find: false,
            findAll: false,
            create: false,
            update: false,
            destroy: false,
            lastModified:false
        }
        let foundIndex = this.configuration.findIndex((config) => config.stateName === name);
        if (foundIndex >= 0) {
            config = this.configuration[foundIndex];
        }
        return config;
    }

    private callbackForRemoveItem(data: any, status: number, associatedStateName: string) {
        logger(`callback for remove item for state ${associatedStateName} with status ${status} - not forwarded`);
        if (status >= 200 && status <= 299) { // do we have any data?

        }
        logger(data);
    }

    private callbackForUpdateItem(data: any, status: number, associatedStateName: string) {
        logger(`callback for update item for state ${associatedStateName} with status ${status} - not forwarded`);
        if (status >= 200 && status <= 299) { // do we have any data?
        }
        logger(data);
    }

    private callbackForGetItems(data: any, status: number, associatedStateName: string) {
        logger(`callback for get items for state ${associatedStateName} with status ${status} - FORWARDING`);
        logger(data);
        if (status >= 200 && status <= 299) { // do we have any data?

            this.setCompletedRun(associatedStateName, data);
            this.clearRunInProgress(associatedStateName);

            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.StateChanged, null);
        }
    }

    private callbackForFindItem(data: any, status: number, associatedStateName: string) {
        logger(`callback for find item for state ${associatedStateName} with status ${status} - FORWARDING`);
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.FindItem, null);
        }
    }

    private callbackForModifiedItem(data: any, status: number, associatedStateName: string) {
        logger(`callback for modified item for state ${associatedStateName} with status ${status}`);
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            if (data.isModified) {
                this._findItemInStateNoCheck(associatedStateName,data);
            }
            else {
                this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.ItemNotModified, null);
            }
        }
        // did the call fail? (server loss)
        if (status === 500) {
            logger(data);
            logger(`Item modified check - offline assume unchanged for now`);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.ItemAdded, null);
        }
    }

    private callbackForAddItem(data: any, status: number, associatedStateName: string, wasOffline?: boolean) {
        logger(`callback for add item for state ${associatedStateName} with status ${status} - FORWARDING`);
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);

            if (!wasOffline) {
                this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.ItemAdded, null);
            } else {
                logger('Item was added offline, update the current data');
                this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.ItemUpdated, null);
            }

        }
        // did the call fail? (server loss)
        if (status === 500) {
            logger(data);
            logger(`Item adding - offline, but will be queued later`);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.ItemAdded, null);
        }
    }

}
