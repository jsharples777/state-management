import { ClientDataMessage, SocketListener } from "../../socket/SocketListener";
import { StateManager } from "../interface/StateManager";
import { StateChangeListener } from "../interface/StateChangeListener";
import { AsynchronousStateManager } from "../interface/AsynchronousStateManager";
export declare class SubCache implements StateChangeListener, SocketListener {
    private cache;
    private cacheConfig;
    private dbName;
    private refreshDates;
    private applicationState;
    private hasLoadedUpdatedDates;
    private hasLoadedCache;
    private hasLoadedRefreshDates;
    private lastUpdatedDates;
    constructor(applicationState: StateManager, dbName: string, shouldEncrypt: boolean);
    stateChanged(managerName: string, name: string, newValue: any): void;
    getListenerName(): string;
    addCollectionToCacheConfiguration(collectionName: string, keyField: string, source: AsynchronousStateManager, refreshInSeconds: number): void;
    initialise(): Promise<void>;
    onDocumentLoaded(): void;
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;
    filterResults(managerName: string, name: string, filterResults: any): void;
    foundResult(managerName: string, name: string, foundItem: any): void;
    handleMessage(message: string): void;
    handleDataChangedByAnotherUser(message: ClientDataMessage): void;
    setLastUpdatedDates(data: any): void;
    private getLocalStorageKey;
    loadCache(): void;
}
