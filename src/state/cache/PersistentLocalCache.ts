import debug from 'debug';
import {StateManager} from "../interface/StateManager";
import {SecurityManager} from "../../security/SecurityManager";
import {AsynchronousStateManager} from "../interface/AsynchronousStateManager";
import {SimpleRequest} from "../../network/Types";
import {ApiUtil} from "../../network/ApiUtil";
import {ObjectDefinitionRegistry} from "../../model/ObjectDefinitionRegistry";
import {SubCache} from "./SubCache";

const logger = debug('persistent-local-cache');

export type CachedCollection = {
    name: string,
    keyField: string,
    source: AsynchronousStateManager,
    refreshInterval: number,
    lastRefreshed: number,
    shouldRefresh: boolean
}


export class PersistentLocalCache {
    public static COLLECTION_NAME_LAST_REFRESHED = 'persistent-local-cache-last-refresh';
    public static COLLECTION_NAME_PREFIX = 'persistent-local-cache-';
    private static _instance: PersistentLocalCache;
    private static DEFAULT_URL_FOR_LAST_UPDATED_DATES = '/getlastupdateddates';
    private cacheConfig: CachedCollection[] = [];
    private encryptedCacheConfig: CachedCollection[] = [];
    private dbName = '';
    // @ts-ignore
    private applicationState: StateManager;
    private hasLoadedUpdatedDates: boolean = false;
    private lastUpdatedDates: any[] = [];
    private isLoadingLastUpdateDates: boolean = false;
    private cache: SubCache | null = null;
    private encryptedCache: SubCache | null = null;

    private constructor() {
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


    public addCollectionToCacheConfiguration(collectionName: string, keyField: string, source: AsynchronousStateManager, refreshInSeconds: number, encrypt: boolean = false) {

        if (!encrypt) {
            this.cacheConfig.push({
                name: collectionName,
                keyField: keyField,
                source: source,
                refreshInterval: refreshInSeconds,
                lastRefreshed: 0,
                shouldRefresh: false
            });

        } else {
            this.encryptedCacheConfig.push({
                name: collectionName,
                keyField: keyField,
                source: source,
                refreshInterval: refreshInSeconds,
                lastRefreshed: 0,
                shouldRefresh: false
            });
        }
    }

    public async initialiseAfterCollectionsAddedToCacheConfiguration(dbName: string, applicationState: StateManager) {
        this.applicationState = applicationState;
        this.dbName = dbName;
        if (this.cacheConfig.length > 0) {
            this.cache = new SubCache(applicationState, dbName, false);
            this.cacheConfig.forEach((config) => {
                this.cache?.addCollectionToCacheConfiguration(config.name, config.keyField, config.source, config.refreshInterval);
            });
            this.cache.initialise();
        }
        if (this.encryptedCacheConfig.length > 0) {
            const encryptedDBName = SecurityManager.getInstance().getLoggedInUsername() + '.' + dbName;
            this.encryptedCache = new SubCache(applicationState, encryptedDBName, true);
            this.encryptedCacheConfig.forEach((config) => {
                this.encryptedCache?.addCollectionToCacheConfiguration(config.name, config.keyField, config.source, config.refreshInterval);
            });
            this.encryptedCache.initialise();
        }

    }

    public onDocumentLoaded(): void {
        if (this.cache) this.cache.onDocumentLoaded();
        if (this.encryptedCache) this.encryptedCache.onDocumentLoaded();
        if (this.hasLoadedUpdatedDates) {
            if (this.cache) this.cache.loadCache();
            if (this.encryptedCache) this.encryptedCache.loadCache();

        }
    }


    protected callbackForLastUpdatedDates(data: any, status: number): void {
        logger(`Callback - Last updated dates`);
        if (status === 200) {
            logger(`Last updated dates`);
            this.hasLoadedUpdatedDates = true;
            this.lastUpdatedDates = data;
            if (this.cache) this.cache.setLastUpdatedDates(data);
            if (this.encryptedCache) this.encryptedCache.setLastUpdatedDates(data);
        }
    }

    public removeAllCaches() {
        if (this.cache) this.cache.removeAllCaches();
        if (this.encryptedCache) this.encryptedCache.removeAllCaches();
    }

    public deleteAllCaches() {
        if (this.cache) this.cache.deleteCache();
        if (this.encryptedCache) this.encryptedCache.deleteCache();

    }


}
