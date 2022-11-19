import debug from 'debug';
import {StateManager} from "../interface/StateManager";
import {StateChangeListener} from "../interface/StateChangeListener";
import {StateTimerListener} from "../interface/StateTimerListener";

const logger = debug('state-timing-manager');

type RemoteState = {
    name: string,
    displayName: string,
    isLoaded: boolean
}

export class StateTimingManager implements StateChangeListener {

    private applicationStateManager: StateManager;
    private states: RemoteState[];
    private listeners: StateTimerListener[];
    private stateAllLoaded: boolean;

    public constructor(applicationStateManager: StateManager) {
        this.applicationStateManager = applicationStateManager;
        this.states = [];
        this.listeners = [];
        this.stateAllLoaded = false;
    }

    public addListener(listener: StateTimerListener) {
        this.listeners.push(listener);
    }

    public addCollectionToTimer(collectionName: string, displayName: string) {
        this.states.push({
            name: collectionName,
            displayName: displayName,
            isLoaded: false
        });
        this.applicationStateManager.addChangeListenerForName(collectionName, this);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    foundResult(managerName: string, name: string, foundItem: any): void {
    }

    itemNotModified(managerName: string, name: string, item: any): void {
    }

    getListenerName(): string {
        return "State Timing Manager";
    }

    getTotalStateCount(): number {
        return this.states.length;
    }

    getNumberOfStatesLoaded(): number {
        let result = 0;
        this.states.forEach((state) => {
            if (state.isLoaded) {
                result++;
            }
        });
        return result;
    }

    stateChanged(managerName: string, name: string, newValue: any): void {
        if (this.stateAllLoaded) return;

        const foundIndex = this.states.findIndex((config) => config.name === name);
        if (foundIndex >= 0) {
            const config = this.states[foundIndex];
            logger(`Collection ${config.name} received - setting loaded`);
            config.isLoaded = true;
            this.listeners.forEach((listener) => listener.stateLoaded(config.name, config.displayName));

            logger(`Checking to see if all configured states loaded`);
            let loadedCount = 0;
            let buffer: string = 'Still waiting for ';
            this.states.forEach((state) => {
                if (state.isLoaded) {
                    loadedCount++;
                } else {
                    buffer += state.name + ', ';
                }
            });

            if (loadedCount === this.states.length) {
                logger(`All configured states loaded, informing listeners`);
                this.stateAllLoaded = true;
                this.listeners.forEach((listener) => listener.allConfiguredStatesAreLoaded());
            } else {
                logger(buffer);
            }

        } else {
            logger(`Collection ${name} received - NOT FOUND in config`);
        }

    }

}
