import { StateEventType } from "../interface/StateManager";
import { RequestType } from "../../network/Types";
import { DownloadManager } from "../../network/DownloadManager";
import debug from 'debug';
import { CallbackRegistry } from "../../network/CallbackRegistry";
import { AbstractAsynchronousStateManager } from "./AbstractAsynchronousStateManager";
import { GlobalContextSupplier } from "../helper/GlobalContextSupplier";
const logger = debug('state-manager-api');
export class RESTApiStateManager extends AbstractAsynchronousStateManager {
    constructor(id) {
        super(id, 'restapi');
        this.configuration = [];
        this.callbackForAddItem = this.callbackForAddItem.bind(this);
        this.callbackForRemoveItem = this.callbackForRemoveItem.bind(this);
        this.callbackForUpdateItem = this.callbackForUpdateItem.bind(this);
        this.callbackForGetItems = this.callbackForGetItems.bind(this);
        this.callbackForFindItem = this.callbackForFindItem.bind(this);
        // function ids
        this.functionIdAddItem = RESTApiStateManager.FUNCTION_ID_ADD_ITEM + id;
        this.functionIdRemoveItem = RESTApiStateManager.FUNCTION_ID_REMOVE_ITEM + id;
        this.functionIdUpdateItem = RESTApiStateManager.FUNCTION_ID_UPDATE_ITEM + id;
        this.functionIdGetItems = RESTApiStateManager.FUNCTION_ID_GET_ITEMS + id;
        this.functionIdFindItem = RESTApiStateManager.FUNCTION_ID_FIND_ITEM + id;
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdAddItem, this.callbackForAddItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdRemoveItem, this.callbackForRemoveItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdUpdateItem, this.callbackForUpdateItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdGetItems, this.callbackForGetItems);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdFindItem, this.callbackForFindItem);
    }
    static getInstance() {
        if (!(RESTApiStateManager._instance)) {
            RESTApiStateManager._instance = new RESTApiStateManager("1");
        }
        return RESTApiStateManager._instance;
    }
    initialise(configs) {
        configs.forEach((config) => {
            this.addConfig(config);
        });
        this.initialised = true;
    }
    addConfig(config) {
        this.configuration.push(config);
        this.addStateNameToConfigurations(config.stateName);
        this.initialised = true;
    }
    addConfigByStateNameAndApi(stateName, api, idField = '_id') {
        let config = {
            stateName: stateName,
            serverURL: '',
            api: api,
            isActive: true,
            idField: idField,
            find: true,
            findAll: true,
            create: true,
            update: true,
            destroy: true
        };
    }
    _addNewNamedStateToStorage(state) {
    }
    _getState(name) {
        logger(`Getting All ${name}`);
        if (this.hasCompletedRun(name)) {
            logger(`Getting All ${name} - not done - previously retrieved`);
        }
        else {
            if (!this.isRunInProgress(name)) {
                this.setRunInProgress(name);
                let config = this.getConfigurationForStateName(name);
                if (config.isActive && config.findAll) {
                    const jsonRequest = {
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
                }
                else {
                    logger(`No configuration for state ${name}`);
                }
            }
        }
        let state = { name: name, value: [], hasBeenSet: false };
        return state;
    }
    _ensureStatePresent(name) {
    }
    _replaceNamedStateInStorage(state) {
    }
    _saveState(name, stateObj) {
    }
    _addItemToState(name, stateObj, isPersisted = false) {
        if (isPersisted)
            return; // dont add complete objects to the state - they are already processed
        logger(`Adding item to ${name}`);
        logger(stateObj);
        let config = this.getConfigurationForStateName(name);
        if (config.isActive && config.create) {
            const jsonRequest = {
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
        }
        else {
            logger(`No configuration for state ${name}`);
        }
    }
    _removeItemFromState(name, stateObj, isPersisted) {
        if (isPersisted)
            return; // dont remove complete objects to the state - they are already processed
        logger(`Removing item from ${name}`);
        logger(stateObj);
        let config = this.getConfigurationForStateName(name);
        let identifier = stateObj.id;
        if (config.idField) {
            identifier = stateObj[config.idField];
        }
        if (config.isActive && config.destroy) {
            const jsonRequest = {
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
        }
        else {
            logger(`No configuration for state ${name}`);
        }
    }
    _updateItemInState(name, stateObj, isPersisted) {
        if (isPersisted)
            return; // dont update complete objects to the state - they are already processed
        logger(`Updating item in ${name}`);
        logger(stateObj);
        let config = this.getConfigurationForStateName(name);
        if (config.isActive && config.update) {
            const jsonRequest = {
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
        }
        else {
            logger(`No configuration for state ${name}`);
        }
    }
    _findItemsInState(name, filters) {
        // TO DO
        return [];
    }
    _findItemInState(name, item) {
        logger(`Finding item from ${name}`);
        logger(item);
        let config = this.getConfigurationForStateName(name);
        let identifier = item.id;
        if (config.idField) {
            identifier = item[config.idField];
        }
        if (config.isActive && config.find) {
            const jsonRequest = {
                url: config.serverURL + config.api,
                type: RequestType.GET,
                params: {
                    id: identifier
                },
                callbackId: this.functionIdFindItem,
                associatedStateName: name
            };
            DownloadManager.getInstance().addApiRequest(jsonRequest, true);
        }
        else {
            logger(`No configuration for state ${name}`);
        }
    }
    getConfigurationForStateName(name) {
        let config = {
            stateName: name,
            serverURL: '',
            api: '',
            isActive: false,
            find: false,
            findAll: false,
            create: false,
            update: false,
            destroy: false
        };
        let foundIndex = this.configuration.findIndex((config) => config.stateName === name);
        if (foundIndex >= 0) {
            config = this.configuration[foundIndex];
        }
        return config;
    }
    callbackForRemoveItem(data, status, associatedStateName) {
        logger(`callback for remove item for state ${associatedStateName} with status ${status} - not forwarded`);
        if (status >= 200 && status <= 299) { // do we have any data?
        }
        logger(data);
    }
    callbackForUpdateItem(data, status, associatedStateName) {
        logger(`callback for update item for state ${associatedStateName} with status ${status} - not forwarded`);
        if (status >= 200 && status <= 299) { // do we have any data?
        }
        logger(data);
    }
    callbackForGetItems(data, status, associatedStateName) {
        logger(`callback for get items for state ${associatedStateName} with status ${status} - FORWARDING`);
        logger(data);
        if (status >= 200 && status <= 299) { // do we have any data?
            this.setCompletedRun(associatedStateName, data);
            this.clearRunInProgress(associatedStateName);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.StateChanged, null);
        }
    }
    callbackForFindItem(data, status, associatedStateName) {
        logger(`callback for find item for state ${associatedStateName} with status ${status} - FORWARDING`);
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.FindItem, null);
        }
    }
    callbackForAddItem(data, status, associatedStateName, wasOffline) {
        logger(`callback for add item for state ${associatedStateName} with status ${status} - FORWARDING`);
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            if (!wasOffline) {
                this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.ItemAdded, null);
            }
            else {
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
RESTApiStateManager.FUNCTION_ID_ADD_ITEM = 'rest.api.state.manager.add.item';
RESTApiStateManager.FUNCTION_ID_REMOVE_ITEM = 'rest.api.state.manager.remove.item';
RESTApiStateManager.FUNCTION_ID_UPDATE_ITEM = 'rest.api.state.manager.update.item';
RESTApiStateManager.FUNCTION_ID_GET_ITEMS = 'rest.api.state.manager.get.items';
RESTApiStateManager.FUNCTION_ID_FIND_ITEM = 'rest.api.state.manager.find.item';
//# sourceMappingURL=RESTApiStateManager.js.map