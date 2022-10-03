import debug from 'debug';
import moment from "moment";
import {v4} from "uuid";
import {ClientDataMessage, DataChangeType, SocketListener} from "../../socket/SocketListener";
import {CollectionConfig, IndexedDBStateManager} from "../implementation/IndexedDBStateManager";
import {StateManager} from "../interface/StateManager";
import {SecurityManager} from "../../security/SecurityManager";
import {SocketManager} from "../../socket/SocketManager";
import {StateChangeListener} from "../interface/StateChangeListener";
import {AsynchronousStateManager} from "../interface/AsynchronousStateManager";
import {SimpleRequest} from "../../network/Types";
import {ApiUtil} from "../../network/ApiUtil";
import {ObjectDefinitionRegistry} from "../../model/ObjectDefinitionRegistry";
import {EncryptedIndexedDBStateManager} from "../implementation/EncryptedIndexedDBStateManager";

const logger = debug('persistent-local-cache');

type CachedCollection = {
    name: string,
    lsName:string,
    keyField: string,
    source: AsynchronousStateManager,
    refreshInterval: number,
    lastRefreshed: number,
    shouldRefresh: boolean,
    encrypt:boolean
}

export class PersistentLocalCache implements StateChangeListener, SocketListener {
    private static _instance: PersistentLocalCache;
    private static COLLECTION_NAME_LAST_REFRESHED = 'persistent-local-cache-last-refresh';
    private static COLLECTION_NAME_PREFIX = 'persistent-local-cache-';

    private static DEFAULT_URL_FOR_LAST_UPDATED_DATES = '/getlastupdateddates';
    private lastRefresh: IndexedDBStateManager;
    private cache: IndexedDBStateManager;
    private encryptedCache: EncryptedIndexedDBStateManager;
    private cacheConfig: CachedCollection[] = [];
    private dbName = '';
    private refreshDates: any = {};
    // @ts-ignore
    private applicationState: StateManager;
    private hasLoadedUpdatedDates: boolean = false;
    private hasLoadedCache: boolean = false;
    private hasLoadedRefreshDates: boolean = false;
    private lastUpdatedDates: any[] = [];
    private isLoadingLastUpdateDates: boolean = false;

    private constructor() {
        this.cache = new IndexedDBStateManager();
        this.lastRefresh = new IndexedDBStateManager();
        this.encryptedCache = new EncryptedIndexedDBStateManager();

        this.callbackForLastUpdatedDates = this.callbackForLastUpdatedDates.bind(this);
        this.loadLastUpdatedDates();
        ObjectDefinitionRegistry.getInstance().addDefinition(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, 'Local Cache', true, false, false, "_id");

    }

    public static getInstance() {
        if (!(PersistentLocalCache._instance)) {
            PersistentLocalCache._instance = new PersistentLocalCache();
        }
        return PersistentLocalCache._instance;
    }

    public loadLastUpdatedDates() {
        if (this.isLoadingLastUpdateDates) return;

        this.isLoadingLastUpdateDates = true;
        logger(`Getting last updated dates`);
        let request: SimpleRequest = {
            url: PersistentLocalCache.DEFAULT_URL_FOR_LAST_UPDATED_DATES,
            body: {},
            callback: this.callbackForLastUpdatedDates
        }
        ApiUtil.getInstance().simplePOSTJSON(request);
    }

    stateChanged(managerName: string, name: string, newValue: any): void {
        switch (managerName) {
            case 'indexeddb': {
                if (name === PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED) {
                    logger(`Loading last refresh dates`);
                    logger(newValue);

                    const nowAsNumber = parseInt(moment().format('YYYYMMDDHHmmss'));

                    if (newValue.length > 0) {
                        this.refreshDates = newValue[0];
                        this.cacheConfig.forEach((config) => {
                            const lastRefresh = this.refreshDates[config.name];

                            // when was the state last updated?
                            const foundIndex = this.lastUpdatedDates.findIndex((value) => value.name === config.name);
                            let lastUpdated = 0;
                            if (foundIndex >= 0) {
                                lastUpdated = this.lastUpdatedDates[foundIndex].lastUpdated;
                                logger(`collection ${config.name} last updated at server ${lastUpdated}`);
                            }

                            if (lastRefresh) {
                                // check to see if we need an update
                                logger(`collection ${config.name} last refreshed ${lastRefresh}`);
                                const lastRefreshPlusInterval = parseInt(moment(lastRefresh, 'YYYYMMDDHHmmss').add(config.refreshInterval, 'seconds').format('YYYYMMDDHHmmss'));

                                if (lastRefreshPlusInterval < nowAsNumber) {
                                    logger(`Refresh interval expired, should refresh`);
                                    localStorage.removeItem(this.getLocalStorageKey(config.lsName));
                                    config.lastRefreshed = nowAsNumber;
                                    this.refreshDates[config.name] = nowAsNumber;
                                    config.shouldRefresh = true;
                                }
                                if (lastUpdated > lastRefresh) {
                                    logger(`Last updated at server is after last refresh`);
                                    localStorage.removeItem(this.getLocalStorageKey(config.lsName));
                                    config.lastRefreshed = nowAsNumber;
                                    this.refreshDates[config.name] = nowAsNumber;
                                    config.shouldRefresh = true;
                                }
                            } else {
                                logger(`No refresh, setting to now`);
                                localStorage.removeItem(this.getLocalStorageKey(config.lsName));
                                config.lastRefreshed = nowAsNumber;
                                this.refreshDates[config.name] = nowAsNumber;
                                config.shouldRefresh = true;
                            }

                        });
                    } else {
                        logger(`No refresh dates, setting to now`);
                        this.refreshDates['_id'] = v4();
                        this.cacheConfig.forEach((config) => {
                            localStorage.removeItem(this.getLocalStorageKey(config.lsName));
                            config.lastRefreshed = nowAsNumber;
                            this.refreshDates[config.name] = nowAsNumber;
                            config.shouldRefresh = true;
                        });
                    }
                    logger(`New refresh dates are:`);
                    logger(this.refreshDates);
                    this.lastRefresh.updateItemInCollection(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, this.refreshDates, "_id");
                    this.hasLoadedRefreshDates = true;
                    this.loadCache();
                } else {
                    // is this one of the states we are monitoring
                    const foundIndex = this.cacheConfig.findIndex((config) => config.name === name);
                    if (foundIndex >= 0) {
                        const config = this.cacheConfig[foundIndex];
                        logger(`Collection ${config.name} received from local cache - loading into application state`);
                        this.applicationState.setStateByName(config.name, newValue, true);
                    }
                }
                break;
            }
            default: { // remote source
                // is this one of the states we are monitoring
                const foundIndex = this.cacheConfig.findIndex((config) => config.name === name);
                if (foundIndex >= 0) {
                    const config = this.cacheConfig[foundIndex];
                    const previouslyLoaded = localStorage.getItem(this.getLocalStorageKey(config.lsName));
                    if (config.shouldRefresh || (!(previouslyLoaded))) {
                        config.shouldRefresh = false;
                        config.lastRefreshed = parseInt(moment().format('YYYYMMDDHHmmss'));
                        localStorage.setItem(this.getLocalStorageKey(config.lsName), `${config.lastRefreshed}`);

                        this.refreshDates[config.name] = config.lastRefreshed;
                        logger(`Collection ${config.name} received from remote source - loading into cache`);
                        if (config.encrypt) {
                            this.encryptedCache.setStateByName(config.name, newValue, false);
                        }
                        else {
                            this.cache.setStateByName(config.name, newValue, false);
                        }

                        logger(`Updating last refreshed for ${config.name} to now`);
                        logger(this.refreshDates);
                        this.lastRefresh.updateItemInCollection(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, this.refreshDates, "_id");
                    } else {
                        logger(`Already received ${config.name} from cache`);
                    }
                }
            }
        }
    }

    getListenerName(): string {
        return 'Persistent Cache'
    }

    public addCollectionToCacheConfiguration(collectionName: string, keyField: string, source: AsynchronousStateManager, refreshInSeconds: number, encrypt:boolean = false) {

        if (!encrypt) {
            this.cacheConfig.push({
                name: collectionName,
                lsName: collectionName,
                keyField: keyField,
                source: source,
                refreshInterval: refreshInSeconds,
                lastRefreshed: 0,
                shouldRefresh: false,
                encrypt: encrypt
            });
            this.cache.addChangeListenerForName(collectionName, this);

        }
        else {
            this.cacheConfig.push({
                name: collectionName,
                lsName: SecurityManager.getInstance().getLoggedInUsername().trim() + '.' + collectionName,
                keyField: keyField,
                source: source,
                refreshInterval: refreshInSeconds,
                lastRefreshed: 0,
                shouldRefresh: false,
                encrypt: encrypt
            });
            this.encryptedCache.addChangeListenerForName(collectionName, this);
        }

        source.addChangeListenerForName(collectionName, this);
    }

    public async initialiseAfterCollectionsAddedToCacheConfiguration(dbName: string, applicationState: StateManager) {
        this.applicationState = applicationState;
        this.dbName = dbName;
        const collections: CollectionConfig[] = [];
        const encryptedCollections: CollectionConfig[] = [];
        const refreshCollections: CollectionConfig[] = [];
        this.cacheConfig.forEach((config) => {
            if (config.encrypt) {
                encryptedCollections.push({
                    name: config.name,
                    keyField: config.keyField
                });
            }
            else {
                collections.push({
                    name: config.name,
                    keyField: config.keyField
                })
            }

        });

        // add the collection for the refresh dates
        refreshCollections.push({
            name: PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED,
            keyField: '_id'
        });
        this.lastRefresh.addChangeListenerForName(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, this);
        await this.cache.initialise(dbName, collections);
        const userRefreshDBName = SecurityManager.getInstance().getLoggedInUsername().trim() + '.' + dbName;
        await this.lastRefresh.initialise(userRefreshDBName,refreshCollections);
        await this.encryptedCache.initialise(dbName, encryptedCollections);
        // load the last refresh dates
        this.lastRefresh.getStateByName(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED);
    }

    public isReadyToLoadCache(): boolean {
        return (this.hasLoadedRefreshDates && this.hasLoadedUpdatedDates);
    }

    public onDocumentLoaded(): void {
        SocketManager.getInstance().addListener(this);
        if (this.hasLoadedUpdatedDates) {
            if (this.hasLoadedRefreshDates) {
                this.loadCache();
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    foundResult(managerName: string, name: string, foundItem: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleMessage(message: string): void {
    }

    getCurrentUser(): string {
        return SecurityManager.getInstance().getLoggedInUserId().trim();
    }

    handleDataChangedByAnotherUser(message: ClientDataMessage): void {
        const stateObj = message.data;
        logger(stateObj);

        // update our local cache with the new changes (relies on the socket telling us about them!)
        try {
            const foundIndex = this.cacheConfig.findIndex((config) => config.name === message.stateName);
            if (foundIndex >= 0) {
                const config = this.cacheConfig[foundIndex];
                const nowAsNumber = parseInt(moment().format('YYYYMMDDHHmmss'));
                this.refreshDates[config.name] = nowAsNumber;

                logger(`Received data message for ${config.name} with message type ${message.type}`);
                this.lastRefresh.updateItemInCollection(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, this.refreshDates, "_id").then(() => {
                    switch (message.type) {
                        case DataChangeType.create: {
                            if (config.encrypt) {
                                this.encryptedCache.addNewItemToState(config.name, stateObj, false);
                            }
                            else {
                                this.cache.addNewItemToState(config.name, stateObj, false);
                            }
                            break;
                        }
                        case DataChangeType.update: {
                            if (config.encrypt) {
                                this.encryptedCache.updateItemInState(config.name, stateObj, false);
                            }
                            else {
                                this.cache.updateItemInState(config.name, stateObj, false);
                            }
                            break;
                        }
                        case DataChangeType.delete: {
                            if (config.encrypt) {
                                this.encryptedCache.removeItemFromState(config.name, stateObj, false);
                            }
                            else {
                                this.cache.removeItemFromState(config.name, stateObj, false);
                            }
                            break;
                        }
                    }
                });

            }
        } catch (err) {
            logger(err);
        }

    }

    protected callbackForLastUpdatedDates(data: any, status: number): void {
        logger(`Callback - Last updated dates`);
        if (status === 200) {
            logger(`Last updated dates`);
            this.hasLoadedUpdatedDates = true;
            this.lastUpdatedDates = data;
            this.loadCache();
        }
    }

    private getLocalStorageKey(collectionName: string): string {
        return `${this.dbName}.${PersistentLocalCache.COLLECTION_NAME_PREFIX}${collectionName}`;
    }

    private loadCache() {
        logger(`loading cache - already loaded? ${this.hasLoadedCache}, updates dates from server loaded? ${this.hasLoadedUpdatedDates}, refresh dates loaded? ${this.hasLoadedRefreshDates}`);
        if (!(this.hasLoadedUpdatedDates)) return;
        if (!(this.hasLoadedRefreshDates)) return;
        if (this.hasLoadedCache) return;

        this.cacheConfig.forEach((config) => {
            // check to see if needs to be refreshed
            const cacheLoaded = localStorage.getItem(this.getLocalStorageKey(config.lsName));
            if (cacheLoaded) {
                logger(`${config.name} has been previously loaded, needs refresh? ${config.shouldRefresh}`);
                if (config.shouldRefresh) {
                    logger(`Loading ${config.name} from remote source`);
                    config.source.forceResetForGet(config.name);
                    config.source.getStateByName(config.name);
                } else {
                    logger(`Cache for ${config.name} is up to date, getting from cache`);
                    config.source.setCompletedRun(config.name, []);
                    if (config.encrypt) {
                        this.encryptedCache.getStateByName(config.name);
                    }
                    else {
                        this.cache.getStateByName(config.name);
                    }
                }
            } else {
                logger(`Loading ${config.name} from remote source`);
                config.source.forceResetForGet(config.name);
                config.source.getStateByName(config.name);
            }
        });
    }

}
