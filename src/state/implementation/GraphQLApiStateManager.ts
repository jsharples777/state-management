import {StateEventType, StateValue} from "../interface/StateManager";
import {JSONRequest, RequestType} from "../../network/Types";
import {DownloadManager} from "../../network/DownloadManager";
import debug from 'debug';
import {CallbackRegistry} from "../../network/CallbackRegistry";
import {FilterItem} from "../../CommonTypes";
import {AbstractAsynchronousStateManager} from "./AbstractAsynchronousStateManager";
import {GlobalContextSupplier} from "../helper/GlobalContextSupplier";


/*
*
*   WORK IN PROGRESS
*
 */


const logger = debug('state-manager-graphql');

export type QLConfig = {
    stateName: string,
    serverURL: string,
    apiURL: string,
    apis: {
        findAll: string,
        create: string,
        destroy: string,
        update: string,
        find: string
    }
    data: {
        findAll: string,
        create: string,
        destroy: string,
        update: string,
        find: string
    }
    isActive: boolean,
    getFindAllEachTimeIsCalled:boolean,
    idField?: string
}

export class GraphQLApiStateManager extends AbstractAsynchronousStateManager {
    private static _instance: GraphQLApiStateManager;

    private static FUNCTION_ID_ADD_ITEM = 'graphql.api.state.manager.add.item.';
    private static FUNCTION_ID_REMOVE_ITEM = 'graphql.api.state.manager.remove.item.';
    private static FUNCTION_ID_UPDATE_ITEM = 'graphql.api.state.manager.update.item.';
    private static FUNCTION_ID_GET_ITEMS = 'graphql.api.state.manager.get.items.';
    private static FUNCTION_ID_FIND_ITEM = 'graphql.api.state.manager.find.item.';
    protected configuration: QLConfig[] = [];

    private functionIdAddItem: string;
    private functionIdRemoveItem: string;
    private functionIdUpdateItem: string;
    private functionIdGetItems: string;
    private functionIdFindItem: string;


    public constructor(id: string) {
        super(id, 'graphql');

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

    public static getInstance() {
        if (!(GraphQLApiStateManager._instance)) {
            GraphQLApiStateManager._instance = new GraphQLApiStateManager("1");
        }
        return GraphQLApiStateManager._instance;
    }


    public initialise(configs: QLConfig[]) {
        configs.forEach((config) => {
            this.addConfig(config);
        })

        this.initialised = true;
    }

    public addConfig(config: QLConfig): void {
        this.configuration.push(config);
        this.addStateNameToConfigurations(config.stateName,config.getFindAllEachTimeIsCalled);
        this.initialised = true;
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
                let config: QLConfig = this.getConfigurationForStateName(name);
                if (config.isActive && (config.apis.findAll.trim().length > 0)) {
                    let query = config.apis.findAll;
                    const jsonRequest: JSONRequest = {
                        url: config.serverURL + config.apiURL,
                        type: RequestType.POST,
                        params: {query},
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
        let config: QLConfig = this.getConfigurationForStateName(name);
        if (config.isActive && (config.apis.create.trim().length > 0)) {
            let variables:any = {
                data: stateObj
            }
            // do we have context?
            if (this.contextDelegate) {
                variables.context = this.contextDelegate.getContextForApi();
            }
            else {
                variables.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }
            DownloadManager.getInstance().addQLApiRequest(config.serverURL + config.apiURL, config.apis.create,
                variables, this.functionIdAddItem, name, false);

        } else {
            logger(`No configuration for state ${name}`);
        }
    }

    _findItemInState(name: string, stateObj: any): void {
        logger(`Finding item in ${name}`);
        logger(stateObj);
        let config: QLConfig = this.getConfigurationForStateName(name);
        if (config.isActive && (config.apis.find.trim().length > 0)) {
            let identifier = stateObj.id;
            if (config.idField) {
                identifier = stateObj[config.idField];
            }
            let variables:any = {
                identifier: identifier
            }
            // do we have context?
            if (this.contextDelegate) {
                variables.context = this.contextDelegate.getContextForApi();
            }
            else {
                variables.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }

            DownloadManager.getInstance().addQLApiRequest(config.serverURL + config.apiURL, config.apis.find,
                variables, this.functionIdFindItem, name, true);

        } else {
            logger(`No configuration for state ${name}`);
        }
    }

    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void {
        if (isPersisted) return; // dont remove complete objects to the state - they are already processed
        logger(`Removing item to ${name}`);
        logger(stateObj);
        let config: QLConfig = this.getConfigurationForStateName(name);
        if (config.isActive && (config.apis.destroy.trim().length > 0)) {
            let identifier = stateObj.id;
            if (config.idField) {
                identifier = stateObj[config.idField];
            }
            let variables:any = {
                identifier: identifier
            }
            // do we have context?
            if (this.contextDelegate) {
                variables.context = this.contextDelegate.getContextForApi();
            }
            else {
                variables.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }

            DownloadManager.getInstance().addQLApiRequest(config.serverURL + config.apiURL, config.apis.destroy,
                variables, this.functionIdRemoveItem, name, false);

        } else {
            logger(`No configuration for state ${name}`);
        }
    }

    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void {
        if (isPersisted) return; // dont update complete objects to the state - they are already processed
        logger(`Updating item in ${name}`);
        logger(stateObj);
        let config: QLConfig = this.getConfigurationForStateName(name);
        if (config.isActive && (config.apis.update.trim().length > 0)) {
            let variables:any = {
                data: stateObj
            }
            // do we have context?
            if (this.contextDelegate) {
                variables.context = this.contextDelegate.getContextForApi();
            }
            else {
                variables.context = GlobalContextSupplier.getInstance().getGlobalContextForApi();
            }

            DownloadManager.getInstance().addQLApiRequest(config.serverURL + config.apiURL, config.apis.update,
                variables, this.functionIdUpdateItem, name, false);

        } else {
            logger(`No configuration for state ${name}`);
        }
    }


    _findItemsInState(name: string, filters: FilterItem[]): any[] {
        return [];
    }


    protected getConfigurationForStateName(name: string) {
        let config: QLConfig = {
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
            getFindAllEachTimeIsCalled:false,
            isActive: false
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
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            let config: QLConfig = this.getConfigurationForStateName(associatedStateName);
            let dataAttribute = config.data.findAll;

            this.setCompletedRun(associatedStateName, data.data[dataAttribute]);
            this.clearRunInProgress(associatedStateName);


            this.delegate.informChangeListenersForStateWithName(associatedStateName, data.data[dataAttribute], StateEventType.StateChanged, null);
        }
    }

    private callbackForAddItem(data: any, status: number, associatedStateName: string, wasOffline?: boolean) {
        logger(`callback for add item for state ${associatedStateName} with status ${status} - FORWARDING`);
        let config: QLConfig = this.getConfigurationForStateName(associatedStateName);
        let dataAttribute = config.data.create;

        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            if (!wasOffline) {
                this.delegate.informChangeListenersForStateWithName(associatedStateName, data.data[dataAttribute], StateEventType.ItemAdded, null);
            } else {
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

    private callbackForFindItem(data: any, status: number, associatedStateName: string) {
        logger(`callback for find item for state ${associatedStateName} with status ${status} - FORWARDING`);
        if (status >= 200 && status <= 299) { // do we have any data?
            logger(data);
            this.delegate.informChangeListenersForStateWithName(associatedStateName, data, StateEventType.FindItem, null);
        }
    }
}
