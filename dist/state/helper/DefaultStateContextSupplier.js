import debug from 'debug';
const logger = debug('default-state-context-supplier');
export class DefaultStateContextSupplier {
    constructor(name, supplyingStateManager, equalityFn, contextConfig) {
        this.currentContext = null;
        logger(`Setting up default context supplier for state ${name}`);
        this.name = name;
        this.listeners = [];
        this.equalityFn = equalityFn;
        this.contextConfig = contextConfig;
        supplyingStateManager.addChangeListenerForName(this.name, this);
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    foundResult(managerName, name, foundItem) {
        if (this.currentContext) {
            if (this.equalityFn(this.currentContext, foundItem)) {
                logger(`Found result for state ${name} - informing listeners of the new context`);
                this.listeners.forEach((listener) => listener.stateContextChanged(null));
            }
        }
    }
    getListenerName() {
        return "";
    }
    filterResults(managerName, name, filterResults) {
    }
    stateChanged(managerName, name, newValue) {
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
        // if the item removed was the current context, empty the context
        if (this.currentContext) {
            if (this.equalityFn(this.currentContext, itemRemoved)) {
                logger(`Context for state ${name} has been removed - informing listeners of the empty context`);
                this.currentContext = null;
                this.listeners.forEach((listener) => listener.stateContextChanged(null));
            }
        }
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
        // if the item update was the current context, update the context
        if (this.currentContext) {
            if (this.equalityFn(this.currentContext, itemNewValue)) {
                this.currentContext = itemNewValue;
                logger(`Context for state ${name} has been updated - informing listeners of the new context`);
                this.listeners.forEach((listener) => listener.stateContextChanged(itemNewValue));
            }
        }
    }
    clearContext() {
        logger(`Context has been cleared - informing listeners of the empty context`);
        this.currentContext = null;
        this.listeners.forEach((listener) => listener.stateContextChanged(null));
    }
    setContext(context) {
        logger(`Context has been set - informing listeners of the new context`);
        this.currentContext = context;
        this.listeners.forEach((listener) => listener.stateContextChanged(context));
    }
    getContext() {
        return this.currentContext;
    }
    getStateFromContext() {
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
    getContextForApi() {
        let result = "";
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
    getStateName() {
        return this.name;
    }
}
//# sourceMappingURL=DefaultStateContextSupplier.js.map