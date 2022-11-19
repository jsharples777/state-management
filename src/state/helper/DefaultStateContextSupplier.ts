import {StateContextSupplier, StateManagerContext} from "../interface/StateContextSupplier";
import {StateChangeListener} from "../interface/StateChangeListener";
import {StateContextListener} from "../interface/StateContextListener";
import {StateManager} from "../interface/StateManager";
import {equalityFunction} from "../../CommonTypes";
import debug from 'debug';

const logger = debug('default-state-context-supplier');

export class DefaultStateContextSupplier implements StateContextSupplier, StateChangeListener {
    protected listeners: StateContextListener[];
    protected currentContext: any | null = null;
    protected equalityFn: equalityFunction;
    protected name: string;
    protected contextConfig: StateManagerContext;


    public constructor(name: string, supplyingStateManager: StateManager, equalityFn: equalityFunction, contextConfig: StateManagerContext) {
        logger(`Setting up default context supplier for state ${name}`);
        this.name = name;
        this.listeners = [];
        this.equalityFn = equalityFn;
        this.contextConfig = contextConfig;
        supplyingStateManager.addChangeListenerForName(this.name, this);
    }

    addListener(listener: StateContextListener): void {
        this.listeners.push(listener);
    }


    foundResult(managerName: string, name: string, foundItem: any): void {
        if (this.currentContext) {
            if (this.equalityFn(this.currentContext, foundItem)) {
                logger(`Found result for state ${name} - informing listeners of the new context`);
                this.listeners.forEach((listener) => listener.stateContextChanged(null));
            }
        }
    }

    itemNotModified(managerName: string, name: string, item: any) {
    }

    getListenerName(): string {
        return "";
    }

    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    stateChanged(managerName: string, name: string, newValue: any): void {
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
        // if the item removed was the current context, empty the context
        if (this.currentContext) {
            if (this.equalityFn(this.currentContext, itemRemoved)) {
                logger(`Context for state ${name} has been removed - informing listeners of the empty context`);
                this.currentContext = null;
                this.listeners.forEach((listener) => listener.stateContextChanged(null));
            }
        }
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
        // if the item update was the current context, update the context
        if (this.currentContext) {
            if (this.equalityFn(this.currentContext, itemNewValue)) {
                this.currentContext = itemNewValue;
                logger(`Context for state ${name} has been updated - informing listeners of the new context`);
                this.listeners.forEach((listener) => listener.stateContextChanged(itemNewValue));
            }
        }

    }

    clearContext(): void {
        logger(`Context has been cleared - informing listeners of the empty context`);
        this.currentContext = null;
        this.listeners.forEach((listener) => listener.stateContextChanged(null));
    }

    setContext(context: any): void {
        logger(`Context has been set - informing listeners of the new context`);
        this.currentContext = context;
        this.listeners.forEach((listener) => listener.stateContextChanged(context));
    }

    getContext(): any {
        return this.currentContext;
    }

    getStateFromContext(): any {
        let result = [];
        if (this.contextConfig) {
            if (this.currentContext) {
                let stateValue = this.currentContext[this.contextConfig.contextObjectStateAttribute];
                if (stateValue) {
                    if (!this.contextConfig.contextObjectStateAttributeIsArray) {
                        stateValue = [stateValue];
                    }
                    result = stateValue;
                }
            }
        }
        return result;
    }

    getContextForApi(): any {
        let result: any = "";
        if (this.contextConfig) {
            if (this.currentContext) {
                result = this.currentContext[this.contextConfig.contextObjectId];
                if (!(result)) {
                    result = "";
                }
            }
        }
        return result;
    }

    getStateName():string {
        return this.name;
    }


}
