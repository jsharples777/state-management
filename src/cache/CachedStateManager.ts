import {StateEventType, StateValue} from "../state/interface/StateManager";
import {AbstractAsynchronousStateManager} from "../state/implementation/AbstractAsynchronousStateManager";
import {AsynchronousStateManager} from "../state/interface/AsynchronousStateManager";
import {IndexedDBStateManager} from "../state/implementation/IndexedDBStateManager";
import {FilterItem} from "../CommonTypes";
import {StateChangeListener} from "../state/interface/StateChangeListener";
import moment from "moment";
import {
    FIELD_CreatedBy,
    FIELD_CreatedOn,
    FIELD_ModifiedBy,
    FIELD_ModifiedOn
} from "../model/BasicObjectDefinitionFactory";
import {SecurityManager} from "../security/SecurityManager";
import {ItemMerger} from "./ItemMerger";

export class CachedStateManager extends AbstractAsynchronousStateManager implements StateChangeListener{
    private sourceSM: AsynchronousStateManager;
    private storageSM: IndexedDBStateManager;
    private merger: ItemMerger;

    public constructor(sourceSM:AsynchronousStateManager,storageSM:IndexedDBStateManager,stateNames:string[],merger:ItemMerger) {
        super('1','cachedsm');
        this.sourceSM = sourceSM;
        this.storageSM = storageSM;
        stateNames.forEach((name) => {
            this.sourceSM.addChangeListenerForName(name, this);
            this.storageSM.addChangeListenerForName(name, this);
        });
        this.merger = merger;
    }

    _addItemToState(name: string, stateObj: any, isPersisted: boolean): void {
        const modified = parseInt(moment().format('YYYYMMDDHHmmss'));
        stateObj[FIELD_CreatedOn] = modified;
        stateObj[FIELD_CreatedBy] = SecurityManager.getInstance().getLoggedInUsername();
        stateObj[FIELD_ModifiedOn] = modified;
        stateObj[FIELD_ModifiedBy] = SecurityManager.getInstance().getLoggedInUsername();
        this.sourceSM.addNewItemToState(name,stateObj,isPersisted);
        this.storageSM.addNewItemToState(name,stateObj,isPersisted);
    }

    _addNewNamedStateToStorage(state: StateValue): void {
    }

    _ensureStatePresent(name: string): void {
    }

    _findItemInState(name: string, item: any): any {
        this.storageSM.findItemInState(name, item);
    }

    _findItemsInState(name: string, filters: FilterItem[]): any[] {
        return [];
    }

    _getState(name: string): StateValue {
        this.sourceSM.getStateByName(name);
        return {name:name,value:undefined,hasBeenSet:true};
    }

    _removeItemFromState(name: string, stateObj: any, isPersisted: boolean): void {
        this.sourceSM.removeItemFromState(name, stateObj,isPersisted);
        this.storageSM.removeItemFromState(name, stateObj,isPersisted);
    }

    _replaceNamedStateInStorage(state: StateValue): void {
    }

    _saveState(name: string, stateObj: any): void {
    }

    _updateItemInState(name: string, stateObj: any, isPersisted: boolean): void {
        const modified = parseInt(moment().format('YYYYMMDDHHmmss'));
        stateObj[FIELD_ModifiedOn] = modified;
        stateObj[FIELD_ModifiedBy] = SecurityManager.getInstance().getLoggedInUsername();
        this.sourceSM.addNewItemToState(name,stateObj,isPersisted);
        this.storageSM.addNewItemToState(name,stateObj,isPersisted);
    }

    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    foundResult(managerName: string, name: string, foundItem: any): void {
        if (managerName === IndexedDBStateManager.NAME) {
            // check to see if modified
            this.sourceSM.findItemInState(name, foundItem);
        }
        else {
            this.delegate.informChangeListenersForStateWithName(name, foundItem, StateEventType.FindItem, null);
            this.storageSM.updateItemInState(name, foundItem ,false);
        }
    }

    getListenerName(): string {
        return "cache";
    }

    itemNotModified(managerName: string, name: string, item: any): void {
        if (managerName !== IndexedDBStateManager.NAME) {


        }
    }

    stateChanged(managerName: string, name: string, newValue: any): void {
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
    }


}
