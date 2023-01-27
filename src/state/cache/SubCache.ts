import debug from 'debug';
import moment from "moment";
import {v4} from "uuid";
import {ClientDataMessage, DataChangeType, SocketListener} from "../../socket/SocketListener";
import {CollectionConfig, IndexedDBStateManager} from "../implementation/IndexedDBStateManager";
import {StateManager} from "../interface/StateManager";
import {SocketManager} from "../../socket/SocketManager";
import {StateChangeListener} from "../interface/StateChangeListener";
import {AsynchronousStateManager} from "../interface/AsynchronousStateManager";
import {EncryptedIndexedDBStateManager} from "../implementation/EncryptedIndexedDBStateManager";
import {CachedCollection, PersistentLocalCache} from "./PersistentLocalCache";

const logger = debug('persistent-sub-cache');


export class SubCache implements StateChangeListener, SocketListener {
    private cache: IndexedDBStateManager;
    private cacheConfig: CachedCollection[] = [];
    private dbName;
    private refreshDates: any = {};
    private applicationState: StateManager;
    private hasLoadedUpdatedDates: boolean = false;
    private hasLoadedCache: boolean = false;
    private hasLoadedRefreshDates: boolean = false;
    private lastUpdatedDates: any[] = [];


    public constructor(applicationState: StateManager, dbName: string, shouldEncrypt: boolean) {
        this.applicationState = applicationState;
        this.dbName = dbName;
        if (shouldEncrypt) {
            this.cache = new EncryptedIndexedDBStateManager();
        } else {
            this.cache = new IndexedDBStateManager();
        }
    }

    public removeAllCaches(): void {
        this.cacheConfig.forEach((config) => {
            this.cache.setStateByName(config.name,[],true);
        });
    }

    public deleteCache():void {
        this.cache.deleteDatabase();
        if (this.cacheConfig) {
            this.cacheConfig.forEach((config) => {
                localStorage.removeItem(this.getLocalStorageKey(config.name));
            });
        }
    }

    stateChanged(managerName: string, name: string, newValue: any): void {
        switch (managerName) {
            case 'indexeddb': {
                if (name === PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED) {
                    logger(`${this.dbName} - Loading last refresh dates`);
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
                                logger(`${this.dbName} - collection ${config.name} last updated at server ${lastUpdated}`);
                            }

                            if (lastRefresh) {
                                // check to see if we need an update
                                logger(`${this.dbName} - collection ${config.name} last refreshed ${lastRefresh}`);
                                const lastRefreshPlusInterval = parseInt(moment(lastRefresh, 'YYYYMMDDHHmmss').add(config.refreshInterval, 'seconds').format('YYYYMMDDHHmmss'));

                                if (lastRefreshPlusInterval < nowAsNumber) {
                                    logger(`${this.dbName} - Refresh interval expired, should refresh`);
                                    localStorage.removeItem(this.getLocalStorageKey(config.name));
                                    config.lastRefreshed = nowAsNumber;
                                    this.refreshDates[config.name] = nowAsNumber;
                                    config.shouldRefresh = true;
                                }
                                if (lastUpdated > lastRefresh) {
                                    logger(`${this.dbName} - Last updated at server is after last refresh`);
                                    localStorage.removeItem(this.getLocalStorageKey(config.name));
                                    config.lastRefreshed = nowAsNumber;
                                    this.refreshDates[config.name] = nowAsNumber;
                                    config.shouldRefresh = true;
                                }
                            } else {
                                logger(`${this.dbName} - No refresh, setting to now`);
                                localStorage.removeItem(this.getLocalStorageKey(config.name));
                                config.lastRefreshed = nowAsNumber;
                                this.refreshDates[config.name] = nowAsNumber;
                                config.shouldRefresh = true;
                            }

                        });
                    } else {
                        logger(`${this.dbName} - No refresh dates, setting to now`);
                        this.refreshDates['_id'] = v4();
                        this.cacheConfig.forEach((config) => {
                            localStorage.removeItem(this.getLocalStorageKey(config.name));
                            config.lastRefreshed = nowAsNumber;
                            this.refreshDates[config.name] = nowAsNumber;
                            config.shouldRefresh = true;
                        });
                    }
                    logger(`${this.dbName} - New refresh dates are:`);
                    logger(this.refreshDates);
                    this.cache.updateItemInCollection(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, this.refreshDates, "_id");
                    this.hasLoadedRefreshDates = true;
                    this.loadCache();
                } else {
                    // is this one of the states we are monitoring
                    const foundIndex = this.cacheConfig.findIndex((config) => config.name === name);
                    if (foundIndex >= 0) {
                        const config = this.cacheConfig[foundIndex];
                        logger(`${this.dbName} - Collection ${config.name} received from local cache - loading into application state`);
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
                    const previouslyLoaded = localStorage.getItem(this.getLocalStorageKey(config.name));
                    if (config.shouldRefresh || (!(previouslyLoaded))) {
                        config.shouldRefresh = false;
                        config.lastRefreshed = parseInt(moment().format('YYYYMMDDHHmmss'));
                        localStorage.setItem(this.getLocalStorageKey(config.name), `${config.lastRefreshed}`);

                        this.refreshDates[config.name] = config.lastRefreshed;
                        logger(`${this.dbName} - Collection ${config.name} received from remote source - loading into cache`);
                        this.cache.setStateByName(config.name, newValue, false);

                        logger(`${this.dbName} - Updating last refreshed for ${config.name} to now`);
                        logger(this.refreshDates);
                        this.cache.updateItemInCollection(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, this.refreshDates, "_id");
                    } else {
                        logger(`${this.dbName} - Already received ${config.name} from cache`);
                    }
                }
            }
        }
    }

    getListenerName(): string {
        return 'Persistent Cache'
    }

    public addCollectionToCacheConfiguration(collectionName: string, keyField: string, source: AsynchronousStateManager, refreshInSeconds: number) {

        this.cacheConfig.push({
            name: collectionName,
            keyField: keyField,
            source: source,
            refreshInterval: refreshInSeconds,
            lastRefreshed: 0,
            shouldRefresh: false
        });
        this.cache.addChangeListenerForName(collectionName, this);
        source.addChangeListenerForName(collectionName, this);
    }

    public async initialise() {
        const collections: CollectionConfig[] = [];
        this.cacheConfig.forEach((config) => {
            collections.push({
                name: config.name,
                keyField: config.keyField
            })
        });

        // add the collection for the refresh dates
        collections.push({
            name: PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED,
            keyField: '_id'
        });
        this.cache.addChangeListenerForName(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, this);
        await this.cache.initialise(this.dbName, collections);
        // load the last refresh dates
        this.cache.getStateByName(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED);
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

    itemNotModified(managerName: string, name: string, item: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleMessage(message: string): void {
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

                logger(`${this.dbName} - Received data message for ${config.name} with message type ${message.type}`);
                this.cache.updateItemInCollection(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, this.refreshDates, "_id").then(() => {
                    switch (message.type) {
                        case DataChangeType.create: {
                            this.cache.addNewItemToState(config.name, stateObj, false);
                            break;
                        }
                        case DataChangeType.update: {
                            this.cache.updateItemInState(config.name, stateObj, false);
                            break;
                        }
                        case DataChangeType.delete: {
                            this.cache.removeItemFromState(config.name, stateObj, false);
                            break;
                        }
                    }
                });
            }
        } catch (err) {
            logger(err);
        }

    }

    public setLastUpdatedDates(data: any): void {
        this.hasLoadedUpdatedDates = true;
        this.lastUpdatedDates = data;
        this.loadCache();
    }

    private getLocalStorageKey(collectionName: string): string {
        return `${this.dbName}.${PersistentLocalCache.COLLECTION_NAME_PREFIX}${collectionName}`;
    }

    public loadCache() {
        logger(`${this.dbName} - loading cache - already loaded? ${this.hasLoadedCache}, updates dates from server loaded? ${this.hasLoadedUpdatedDates}, refresh dates loaded? ${this.hasLoadedRefreshDates}`);
        if (!(this.hasLoadedUpdatedDates)) return;
        if (!(this.hasLoadedRefreshDates)) return;
        if (this.hasLoadedCache) return;

        this.cacheConfig.forEach((config) => {
            // check to see if needs to be refreshed
            const cacheLoaded = localStorage.getItem(this.getLocalStorageKey(config.name));
            if (cacheLoaded) {
                logger(`${this.dbName} - ${config.name} has been previously loaded, needs refresh? ${config.shouldRefresh}`);
                if (config.shouldRefresh) {
                    logger(`${this.dbName} - Loading ${config.name} from remote source`);
                    config.source.forceResetForGet(config.name);
                    config.source.getStateByName(config.name);
                } else {
                    logger(`${this.dbName} - Cache for ${config.name} is up to date, getting from cache`);
                    config.source.setCompletedRun(config.name, []);
                    this.cache.getStateByName(config.name);
                }
            } else {
                logger(`${this.dbName} - Loading ${config.name} from remote source`);
                config.source.forceResetForGet(config.name);
                config.source.getStateByName(config.name);
            }
        });
    }

}
