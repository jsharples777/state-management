import {JSONRequest, RequestType} from "./Types";
import {Poller} from "./Poller";
import {IndexedDBStateManager} from "../state/implementation/IndexedDBStateManager";
import {v4} from "uuid";
import {DownloadManager} from "./DownloadManager";
import {NotificationManager} from "../notification/NotificationManager";
import {StateChangeListener} from "../state/interface/StateChangeListener";
import {AsynchronousStateManager} from "../state/interface/AsynchronousStateManager";
import debug from "debug";
import {EncryptedIndexedDBStateManager} from "../state/implementation/EncryptedIndexedDBStateManager";
import {ObjectDefinitionRegistry} from "../model/ObjectDefinitionRegistry";
import {FrameworkNotificationSources, NotificationContent, NotificationType} from "../notification/NotificationTypes";

const logger = debug('offline-manager');

export class OfflineManager implements StateChangeListener {
    public static LOCALSTORAGE_KEY_USE_ENCRYPTION = 'offline-manager.use-encryption';
    private static _instance: OfflineManager;
    private static DB_NAME = 'offline.manager.db';
    private static OBJECT_STORE = 'offline.manager.db.requests';
    private persistence: AsynchronousStateManager;

    constructor() {
        this.serverBackOnline = this.serverBackOnline.bind(this);
        const useEncryption = localStorage.getItem(OfflineManager.LOCALSTORAGE_KEY_USE_ENCRYPTION);
        let indexedDB: IndexedDBStateManager;
        if (useEncryption) {
            indexedDB = new EncryptedIndexedDBStateManager();
        } else {
            indexedDB = new IndexedDBStateManager();
        }
        indexedDB.initialise(OfflineManager.DB_NAME, [{name: OfflineManager.OBJECT_STORE, keyField: '_id'}]);
        this.persistence = indexedDB;
        this.persistence.addChangeListenerForName(OfflineManager.OBJECT_STORE, this);
        ObjectDefinitionRegistry.getInstance().addDefinition(OfflineManager.OBJECT_STORE, 'Offline Requests', true, false, false, "_id");

    }

    public static getInstance(): OfflineManager {
        if (!(OfflineManager._instance)) {
            OfflineManager._instance = new OfflineManager();
        }
        return OfflineManager._instance;
    }

    public processQueuedResults() {
        // find any requests in the persistence
        this.persistence.getStateByName(OfflineManager.OBJECT_STORE);
    }

    public serverBackOnline() {
        const notification:NotificationContent = {
            duration: 5000,
            id: v4(),
            message: 'Server is back online',
            source: {
                name: FrameworkNotificationSources.OFFLINE_MANAGER
            },
            title: 'Server',
            type: NotificationType.warning

        }
        NotificationManager.getInstance().show(notification);
        this.processQueuedResults();
    }

    public areWeOffline(): boolean {
        return Poller.getInstance().isPolling();
    }

    public addOfflineRequest(jsonRequest: JSONRequest) {
        if (jsonRequest.type === RequestType.GET) return;

        if (!Poller.getInstance().isPolling()) {
            Poller.getInstance().startPolling(this.serverBackOnline);
            const notification:NotificationContent = {
                duration: 5000,
                id: v4(),
                message: 'Server is offline, queueing local changes for when server is available',
                source: {
                    name: FrameworkNotificationSources.OFFLINE_MANAGER
                },
                title: 'Server',
                type: NotificationType.warning

            }
            NotificationManager.getInstance().show(notification);
        }
        // save the request with an id
        jsonRequest._id = v4();
        logger('Adding offline request');
        logger(jsonRequest);

        this.persistence.addNewItemToState(OfflineManager.OBJECT_STORE, jsonRequest, false);
    }

    getListenerName(): string {
        return "Offline manager";
    }

    stateChanged(managerName: string, name: string, offlineResults: any): void {
        if (offlineResults && offlineResults.length > 0) {
            const notification:NotificationContent = {
                duration: 5000,
                id: v4(),
                message: `There are ${offlineResults.length} queued changes, sending to server.`,
                source: {
                    name: FrameworkNotificationSources.OFFLINE_MANAGER
                },
                title: 'Server',
                type: NotificationType.warning

            }
            NotificationManager.getInstance().show(notification);


            offlineResults.forEach((request: JSONRequest) => {
                this.persistence.removeItemFromState(OfflineManager.OBJECT_STORE, request, false);
                logger(`Processing offline request with priority and from offline`);
                logger(request);
                DownloadManager.getInstance().addApiRequest(request, true, true);
            });
        }
        this.persistence.forceResetForGet(OfflineManager.OBJECT_STORE);
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
    }

    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    foundResult(managerName: string, name: string, foundItem: any): void {
    }


}
