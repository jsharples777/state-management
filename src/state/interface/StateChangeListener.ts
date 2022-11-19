export interface StateChangeListener {
    stateChanged(managerName: string, name: string, newValue: any): void;

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;

    filterResults(managerName: string, name: string, filterResults: any): void;

    foundResult(managerName: string, name: string, foundItem: any): void;

    itemNotModified(managerName: string, name: string, item: any):void;

    getListenerName(): string;
}
