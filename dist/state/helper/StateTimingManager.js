import debug from 'debug';
const logger = debug('state-timing-manager');
export class StateTimingManager {
    constructor(applicationStateManager) {
        this.applicationStateManager = applicationStateManager;
        this.states = [];
        this.listeners = [];
        this.stateAllLoaded = false;
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    addCollectionToTimer(collectionName, displayName) {
        this.states.push({
            name: collectionName,
            displayName: displayName,
            isLoaded: false
        });
        this.applicationStateManager.addChangeListenerForName(collectionName, this);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemAdded(managerName, name, itemAdded) {
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemRemoved(managerName, name, itemRemoved) {
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    filterResults(managerName, name, filterResults) {
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    foundResult(managerName, name, foundItem) {
    }
    itemNotModified(managerName, name, item) {
    }
    getListenerName() {
        return "State Timing Manager";
    }
    getTotalStateCount() {
        return this.states.length;
    }
    getNumberOfStatesLoaded() {
        let result = 0;
        this.states.forEach((state) => {
            if (state.isLoaded) {
                result++;
            }
        });
        return result;
    }
    stateChanged(managerName, name, newValue) {
        if (this.stateAllLoaded)
            return;
        const foundIndex = this.states.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.states[foundIndex];
            logger(`Collection ${config.name} received - setting loaded`);
            config.isLoaded = true;
            this.listeners.forEach((listener) => listener.stateLoaded(config.name, config.displayName));
            logger(`Checking to see if all configured states loaded`);
            let loadedCount = 0;
            let buffer = 'Still waiting for ';
            this.states.forEach((state) => {
                if (state.isLoaded) {
                    loadedCount++;
                }
                else {
                    buffer += state.name + ', ';
                }
            });
            if (loadedCount === this.states.length) {
                logger(`All configured states loaded, informing listeners`);
                this.stateAllLoaded = true;
                this.listeners.forEach((listener) => listener.allConfiguredStatesAreLoaded());
            }
            else {
                logger(buffer);
            }
        }
        else {
            logger(`Collection ${name} received - NOT FOUND in config`);
        }
    }
}
//# sourceMappingURL=StateTimingManager.js.map