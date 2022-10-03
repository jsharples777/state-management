import { StateManager } from "../interface/StateManager";
import { AsynchronousStateManager } from "../interface/AsynchronousStateManager";
export declare type CachedCollection = {
    name: string;
    keyField: string;
    source: AsynchronousStateManager;
    refreshInterval: number;
    lastRefreshed: number;
    shouldRefresh: boolean;
};
export declare class PersistentLocalCache {
    static COLLECTION_NAME_LAST_REFRESHED: string;
    static COLLECTION_NAME_PREFIX: string;
    private static _instance;
    private static DEFAULT_URL_FOR_LAST_UPDATED_DATES;
    private cacheConfig;
    private encryptedCacheConfig;
    private dbName;
    private applicationState;
    private hasLoadedUpdatedDates;
    private lastUpdatedDates;
    private isLoadingLastUpdateDates;
    private cache;
    private encryptedCache;
    private constructor();
    static getInstance(): PersistentLocalCache;
    loadLastUpdatedDates(): void;
    addCollectionToCacheConfiguration(collectionName: string, keyField: string, source: AsynchronousStateManager, refreshInSeconds: number, encrypt?: boolean): void;
    initialiseAfterCollectionsAddedToCacheConfiguration(dbName: string, applicationState: StateManager): Promise<void>;
    onDocumentLoaded(): void;
    protected callbackForLastUpdatedDates(data: any, status: number): void;
}
