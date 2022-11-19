import { StateContextSupplier, StateManagerContext } from "../interface/StateContextSupplier";
import { StateChangeListener } from "../interface/StateChangeListener";
import { StateContextListener } from "../interface/StateContextListener";
import { StateManager } from "../interface/StateManager";
import { equalityFunction } from "../../CommonTypes";
export declare class DefaultStateContextSupplier implements StateContextSupplier, StateChangeListener {
    protected listeners: StateContextListener[];
    protected currentContext: any | null;
    protected equalityFn: equalityFunction;
    protected name: string;
    protected contextConfig: StateManagerContext;
    constructor(name: string, supplyingStateManager: StateManager, equalityFn: equalityFunction, contextConfig: StateManagerContext);
    addListener(listener: StateContextListener): void;
    foundResult(managerName: string, name: string, foundItem: any): void;
    itemNotModified(managerName: string, name: string, item: any): void;
    getListenerName(): string;
    filterResults(managerName: string, name: string, filterResults: any): void;
    stateChanged(managerName: string, name: string, newValue: any): void;
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;
    clearContext(): void;
    setContext(context: any): void;
    getContext(): any;
    getStateFromContext(): any;
    getContextForApi(): any;
    getStateName(): string;
}
