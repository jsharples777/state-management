import { RequestType } from "./Types";
import { Poller } from "./Poller";
import { IndexedDBStateManager } from "../state/implementation/IndexedDBStateManager";
import { v4 } from "uuid";
import { DownloadManager } from "./DownloadManager";
import { NotificationManager } from "../notification/NotificationManager";
import debug from "debug";
import { EncryptedIndexedDBStateManager } from "../state/implementation/EncryptedIndexedDBStateManager";
import { ObjectDefinitionRegistry } from "../model/ObjectDefinitionRegistry";
import { FrameworkNotificationSources, NotificationLocation, NotificationType } from "../notification/NotificationTypes";
const logger = debug('offline-manager');
export class OfflineManager {
    constructor() {
        this.serverBackOnline = this.serverBackOnline.bind(this);
        const useEncryption = localStorage.getItem(OfflineManager.LOCALSTORAGE_KEY_USE_ENCRYPTION);
        let indexedDB;
        if (useEncryption) {
            indexedDB = new EncryptedIndexedDBStateManager();
        }
        else {
            indexedDB = new IndexedDBStateManager();
        }
        indexedDB.initialise(OfflineManager.DB_NAME, [{ name: OfflineManager.OBJECT_STORE, keyField: '_id' }]);
        this.persistence = indexedDB;
        this.persistence.addChangeListenerForName(OfflineManager.OBJECT_STORE, this);
        ObjectDefinitionRegistry.getInstance().addDefinition(OfflineManager.OBJECT_STORE, 'Offline Requests', true, false, false, "_id");
    }
    static getInstance() {
        if (!(OfflineManager._instance)) {
            OfflineManager._instance = new OfflineManager();
        }
        return OfflineManager._instance;
    }
    processQueuedResults() {
        // find any requests in the persistence
        this.persistence.getStateByName(OfflineManager.OBJECT_STORE);
    }
    serverBackOnline() {
        const notification = {
            duration: 5000,
            id: v4(),
            message: 'Server is back online',
            source: {
                name: FrameworkNotificationSources.OFFLINE_MANAGER
            },
            title: 'Server',
            type: NotificationType.warning,
            location: NotificationLocation.topright
        };
        NotificationManager.getInstance().show(notification);
        this.processQueuedResults();
    }
    areWeOffline() {
        return Poller.getInstance().isPolling();
    }
    addOfflineRequest(jsonRequest) {
        if (jsonRequest.type === RequestType.GET)
            return;
        if (jsonRequest.type === RequestType.PATCH)
            return;
        if (!Poller.getInstance().isPolling()) {
            Poller.getInstance().startPolling(this.serverBackOnline);
            const notification = {
                duration: 5000,
                id: v4(),
                message: 'Server is offline, queueing local changes for when server is available',
                source: {
                    name: FrameworkNotificationSources.OFFLINE_MANAGER
                },
                title: 'Server',
                type: NotificationType.warning,
                location: NotificationLocation.topright
            };
            NotificationManager.getInstance().show(notification);
        }
        // save the request with an id
        jsonRequest._id = v4();
        logger('Adding offline request');
        logger(jsonRequest);
        this.persistence.addNewItemToState(OfflineManager.OBJECT_STORE, jsonRequest, false);
    }
    getListenerName() {
        return "Offline manager";
    }
    stateChanged(managerName, name, offlineResults) {
        if (offlineResults && offlineResults.length > 0) {
            const notification = {
                duration: 5000,
                id: v4(),
                message: `There are ${offlineResults.length} queued changes, sending to server.`,
                source: {
                    name: FrameworkNotificationSources.OFFLINE_MANAGER
                },
                title: 'Server',
                type: NotificationType.warning,
                location: NotificationLocation.topright
            };
            NotificationManager.getInstance().show(notification);
            offlineResults.forEach((request) => {
                this.persistence.removeItemFromState(OfflineManager.OBJECT_STORE, request, false);
                logger(`Processing offline request with priority and from offline`);
                logger(request);
                DownloadManager.getInstance().addApiRequest(request, true, true);
            });
        }
        this.persistence.forceResetForGet(OfflineManager.OBJECT_STORE);
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
    }
    filterResults(managerName, name, filterResults) {
    }
    foundResult(managerName, name, foundItem) {
    }
    itemNotModified(managerName, name, item) {
    }
}
OfflineManager.LOCALSTORAGE_KEY_USE_ENCRYPTION = 'offline-manager.use-encryption';
OfflineManager.DB_NAME = 'offline.manager.db';
OfflineManager.OBJECT_STORE = 'offline.manager.db.requests';
//# sourceMappingURL=OfflineManager.js.map