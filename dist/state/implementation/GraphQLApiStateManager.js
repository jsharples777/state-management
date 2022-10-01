import { StateEventType } from "../interface/StateManager";
import { RequestType } from "../../network/Types";
import { DownloadManager } from "../../network/DownloadManager";
import debug from 'debug';
import { CallbackRegistry } from "../../network/CallbackRegistry";
import { AbstractAsynchronousStateManager } from "./AbstractAsynchronousStateManager";
import { GlobalContextSupplier } from "../helper/GlobalContextSupplier";
/*
*
*   WORK IN PROGRESS
*
 */
const logger = debug('state-manager-graphql');
export class GraphQLApiStateManager extends AbstractAsynchronousStateManager {
    constructor(id) {
        super(id, 'graphql');
        this.configuration = [];
        this.callbackForAddItem = this.callbackForAddItem.bind(this);
        this.callbackForRemoveItem = this.callbackForRemoveItem.bind(this);
        this.callbackForUpdateItem = this.callbackForUpdateItem.bind(this);
        this.callbackForGetItems = this.callbackForGetItems.bind(this);
        this.callbackForFindItem = this.callbackForFindItem.bind(this);
        // function ids
        this.functionIdAddItem = GraphQLApiStateManager.FUNCTION_ID_ADD_ITEM + id;
        this.functionIdRemoveItem = GraphQLApiStateManager.FUNCTION_ID_REMOVE_ITEM + id;
        this.functionIdUpdateItem = GraphQLApiStateManager.FUNCTION_ID_UPDATE_ITEM + id;
        this.functionIdGetItems = GraphQLApiStateManager.FUNCTION_ID_GET_ITEMS + id;
        this.functionIdFindItem = GraphQLApiStateManager.FUNCTION_ID_FIND_ITEM + id;
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdAddItem, this.callbackForAddItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdRemoveItem, this.callbackForRemoveItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdUpdateItem, this.callbackForUpdateItem);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdGetItems, this.callbackForGetItems);
        CallbackRegistry.getInstance().addRegisterCallback(this.functionIdFindItem, this.callbackForFindItem);
    }
    static getInstance() {
        if (!(GraphQLApiStateManager._instance)) {
            GraphQLApiStateManager._instance = new GraphQLApiStateManager("1");
        }
        return GraphQLApiStateManager._instance;
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
                if (config.isActive && (config.apis.findAll.trim().length > 0)) {
                    let query = config.apis.findAll;
                    const jsonRequest = {
                        url: config.serverURL + config.apiURL,
                        type: RequestType.POST,
                        params: { query },
                        callbackId: this.functionIdGetItems,
                        associatedStateName: name
                    };
                    logger(`Getting All ${name} with query "${query}"`);
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
        if (config.isActive && (config.apis.create.trim().length > 0)) {
            let variables = {
                data: stateObj
            };
            // do we have context?
            if (this.contextDelegate) {
                variables.context = this.contextDelegate.getContextForApi();
            }
            else {
                variables.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addQLApiRequest(config.serverURL + config.apiURL, config.apis.create, variables, this.functionIdAddItem, name, false);
        }
        else {
            logger(`No configuration for state ${name}`);
        }
    }
    _findItemInState(name, stateObj) {
        logger(`Finding item in ${name}`);
        logger(stateObj);
        let config = this.getConfigurationForStateName(name);
        if (config.isActive && (config.apis.find.trim().length > 0)) {
            let identifier = stateObj.id;
            if (config.idField) {
                identifier = stateObj[config.idField];
            }
            let variables = {
                identifier: identifier
            };
            // do we have context?
            if (this.contextDelegate) {
                variables.context = this.contextDelegate.getContextForApi();
            }
            else {
                variables.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addQLApiRequest(config.serverURL + config.apiURL, config.apis.find, variables, this.functionIdFindItem, name, true);
        }
        else {
            logger(`No configuration for state ${name}`);
        }
    }
    _removeItemFromState(name, stateObj, isPersisted) {
        if (isPersisted)
            return; // dont remove complete objects to the state - they are already processed
        logger(`Removing item to ${name}`);
        logger(stateObj);
        let config = this.getConfigurationForStateName(name);
        if (config.isActive && (config.apis.destroy.trim().length > 0)) {
            let identifier = stateObj.id;
            if (config.idField) {
                identifier = stateObj[config.idField];
            }
            let variables = {
                identifier: identifier
            };
            // do we have context?
            if (this.contextDelegate) {
                variables.context = this.contextDelegate.getContextForApi();
            }
            else {
                variables.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addQLApiRequest(config.serverURL + config.apiURL, config.apis.destroy, variables, this.functionIdRemoveItem, name, false);
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
        if (config.isActive && (config.apis.update.trim().length > 0)) {
            let variables = {
                data: stateObj
            };
            // do we have context?
            if (this.contextDelegate) {
                variables.context = this.contextDelegate.getContextForApi();
            }
            else {
                variables.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addQLApiRequest(config.serverURL + config.apiURL, config.apis.update, variables, this.functionIdUpdateItem, name, false);
        }
        else {
            logger(`No configuration for state ${name}`);
        }
    }
    _findItemsInState(name, filters) {
        return [];
    }
    getConfigurationForStateName(name) {
        let config = {
            stateName: name,
            serverURL: '',
            apiURL: '/graphql',
            apis: {
                findAll: '',
                create: '',
                destroy: '',
                update: '',
                find: ''
            },
            data: {
                findAll: '',
                create: '',
                destroy: '',
                update: '',
                find: ''
            },
            isActive: false
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
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            let config = this.getConfigurationForStateName(associatedStateName);
            let dataAttribute = config.data.findAll;
            this.setCompletedRun(associatedStateName, data.data[dataAttribute]);
            this.clearRunInProgress(associatedStateName);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data.data[dataAttribute], StateEventType.StateChanged, null);
        }
    }
    callbackForAddItem(data, status, associatedStateName, wasOffline) {
        logger(`callback for add item for state ${associatedStateName} with status ${status} - FORWARDING`);
        let config = this.getConfigurationForStateName(associatedStateName);
        let dataAttribute = config.data.create;
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            if (!wasOffline) {
                this.delegate.informChangeListenersForStateWithName(associatedStateName, data.data[dataAttribute], StateEventType.ItemAdded, null);
            }
            else {
                logger('Item was added offline, update the current data');
                this.delegate.informChangeListenersForStateWithName(associatedStateName, data.data[dataAttribute], StateEventType.ItemUpdated, null);
            }
        }
        // did the call fail? (server loss)
        if (status === 500) {
            logger(`Item adding - offline, but will be queued later`);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data.data[dataAttribute], StateEventType.ItemAdded, null);
        }
    }
    callbackForFindItem(data, status, associatedStateName) {
        logger(`callback for find item for state ${associatedStateName} with status ${status} - FORWARDING`);
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.FindItem, null);
        }
    }
}
GraphQLApiStateManager.FUNCTION_ID_ADD_ITEM = 'graphql.api.state.manager.add.item.';
GraphQLApiStateManager.FUNCTION_ID_REMOVE_ITEM = 'graphql.api.state.manager.remove.item.';
GraphQLApiStateManager.FUNCTION_ID_UPDATE_ITEM = 'graphql.api.state.manager.update.item.';
GraphQLApiStateManager.FUNCTION_ID_GET_ITEMS = 'graphql.api.state.manager.get.items.';
GraphQLApiStateManager.FUNCTION_ID_FIND_ITEM = 'graphql.api.state.manager.find.item.';
//# sourceMappingURL=GraphQLApiStateManager.js.map