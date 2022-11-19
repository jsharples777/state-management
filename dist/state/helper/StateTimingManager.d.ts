import { StateManager } from "../interface/StateManager";
import { StateChangeListener } from "../interface/StateChangeListener";
import { StateTimerListener } from "../interface/StateTimerListener";
export declare class StateTimingManager implements StateChangeListener {
    private applicationStateManager;
    private states;
    private listeners;
    private stateAllLoaded;
    constructor(applicationStateManager: StateManager);
    addListener(listener: StateTimerListener): void;
    addCollectionToTimer(collectionName: string, displayName: string): void;
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;
    filterResults(managerName: string, name: string, filterResults: any): void;
    foundResult(managerName: string, name: string, foundItem: any): void;
    itemNotModified(managerName: string, name: string, item: any): void;
    getListenerName(): string;
    getTotalStateCount(): number;
    getNumberOfStatesLoaded(): number;
    stateChanged(managerName: string, name: string, newValue: any): void;
}
