var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import debug from 'debug';
import { ApiUtil } from "../../network/ApiUtil";
import { ObjectDefinitionRegistry } from "../../model/ObjectDefinitionRegistry";
import { SubCache } from "./SubCache";
const logger = debug('persistent-local-cache');
export class PersistentLocalCache {
    constructor() {
        this.cacheConfig = [];
        this.encryptedCacheConfig = [];
        this.dbName = '';
        this.hasLoadedUpdatedDates = false;
        this.lastUpdatedDates = [];
        this.isLoadingLastUpdateDates = false;
        this.cache = null;
        this.encryptedCache = null;
        this.callbackForLastUpdatedDates = this.callbackForLastUpdatedDates.bind(this);
        this.loadLastUpdatedDates();
        ObjectDefinitionRegistry.getInstance().addDefinition(PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED, 'Local Cache', true, false, false, "_id");
    }
    static getInstance() {
        if (!(PersistentLocalCache._instance)) {
            PersistentLocalCache._instance = new PersistentLocalCache();
        }
        return PersistentLocalCache._instance;
    }
    loadLastUpdatedDates() {
        if (this.isLoadingLastUpdateDates)
            return;
        this.isLoadingLastUpdateDates = true;
        logger(`Getting last updated dates`);
        let request = {
            url: PersistentLocalCache.DEFAULT_URL_FOR_LAST_UPDATED_DATES,
            body: {},
            callback: this.callbackForLastUpdatedDates
        };
        ApiUtil.getInstance().simplePOSTJSON(request);
    }
    addCollectionToCacheConfiguration(collectionName, keyField, source, refreshInSeconds, encrypt = false) {
        if (!encrypt) {
            this.cacheConfig.push({
                name: collectionName,
                keyField: keyField,
                source: source,
                refreshInterval: refreshInSeconds,
                lastRefreshed: 0,
                shouldRefresh: false
            });
        }
        else {
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
    initialiseAfterCollectionsAddedToCacheConfiguration(dbName, applicationState) {
        return __awaiter(this, void 0, void 0, function* () {
            this.applicationState = applicationState;
            this.dbName = dbName;
            if (this.cacheConfig.length > 0) {
                this.cache = new SubCache(applicationState, dbName, false);
                this.cacheConfig.forEach((config) => {
                    var _a;
                    (_a = this.cache) === null || _a === void 0 ? void 0 : _a.addCollectionToCacheConfiguration(config.name, config.keyField, config.source, config.refreshInterval);
                });
                this.cache.initialise();
            }
            if (this.encryptedCacheConfig.length > 0) {
                this.encryptedCache = new SubCache(applicationState, dbName, true);
                this.encryptedCacheConfig.forEach((config) => {
                    var _a;
                    (_a = this.encryptedCache) === null || _a === void 0 ? void 0 : _a.addCollectionToCacheConfiguration(config.name, config.keyField, config.source, config.refreshInterval);
                });
                this.encryptedCache.initialise();
            }
        });
    }
    onDocumentLoaded() {
        if (this.cache)
            this.cache.onDocumentLoaded();
        if (this.encryptedCache)
            this.encryptedCache.onDocumentLoaded();
        if (this.hasLoadedUpdatedDates) {
            if (this.cache)
                this.cache.loadCache();
            if (this.encryptedCache)
                this.encryptedCache.loadCache();
        }
    }
    callbackForLastUpdatedDates(data, status) {
        logger(`Callback - Last updated dates`);
        if (status === 200) {
            logger(`Last updated dates`);
            this.hasLoadedUpdatedDates = true;
            this.lastUpdatedDates = data;
            if (this.cache)
                this.cache.setLastUpdatedDates(data);
            if (this.encryptedCache)
                this.encryptedCache.setLastUpdatedDates(data);
        }
    }
    removeAllCaches() {
        if (this.cache)
            this.cache.removeAllCaches();
        if (this.encryptedCache)
            this.encryptedCache.removeAllCaches();
    }
    deleteAllCaches() {
        if (this.cache)
            this.cache.deleteCache();
        if (this.encryptedCache)
            this.encryptedCache.deleteCache();
    }
}
PersistentLocalCache.COLLECTION_NAME_LAST_REFRESHED = 'persistent-local-cache-last-refresh';
PersistentLocalCache.COLLECTION_NAME_PREFIX = 'persistent-local-cache-';
PersistentLocalCache.DEFAULT_URL_FOR_LAST_UPDATED_DATES = '/getlastupdateddates';
//# sourceMappingURL=PersistentLocalCache.js.map