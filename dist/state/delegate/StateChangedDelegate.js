import { StateEventType } from "../interface/StateManager";
import debug from "debug";
const smLogger = debug('state-manager-delegate');
export class StateChangedDelegate {
    constructor(managerName) {
        this.suppressEventEmits = false;
        this.managerName = managerName;
        this.stateChangeListeners = [];
    }
    suppressEvents() {
        this.suppressEventEmits = true;
    }
    emitEvents() {
        this.suppressEventEmits = false;
    }
    informChangeListenersForStateWithName(name, stateObjValue, eventType = StateEventType.StateChanged, previousObjValue = null) {
        smLogger(`State Manager: Informing state listeners of ${name}`);
        if (this.suppressEventEmits) {
            smLogger(`State Manager: Events suppressed`);
            return;
        }
        const foundIndex = this.stateChangeListeners.findIndex(element => element.name === name);
        if (foundIndex >= 0) {
            smLogger(`State Manager: Found state listeners of ${name} with event type ${eventType}`);
            /* let each state change listener know */
            const changeListenersForName = this.stateChangeListeners[foundIndex];
            changeListenersForName.listeners.forEach((listener) => {
                smLogger(`State Manager: Found state listener of ${name} with name ${listener.getListenerName()} - informing`);
                try {
                    switch (eventType) {
                        case (StateEventType.StateChanged): {
                            listener.stateChanged(this.managerName, name, stateObjValue);
                            break;
                        }
                        case (StateEventType.ItemAdded): {
                            listener.stateChangedItemAdded(this.managerName, name, stateObjValue);
                            break;
                        }
                        case (StateEventType.ItemUpdated): {
                            listener.stateChangedItemUpdated(this.managerName, name, previousObjValue, stateObjValue);
                            break;
                        }
                        case (StateEventType.ItemDeleted): {
                            listener.stateChangedItemRemoved(this.managerName, name, stateObjValue);
                            break;
                        }
                        case (StateEventType.FilterResults): {
                            listener.filterResults(this.managerName, name, stateObjValue);
                            break;
                        }
                        case (StateEventType.FindItem): {
                            listener.foundResult(this.managerName, name, stateObjValue);
                            break;
                        }
                    }
                }
                catch (err) {
                    smLogger(err);
                }
            });
        }
    }
    /*
          Add a state listener for a given state name
          the listener should be a function with two parameters
          name - string - the name of the state variable that they want to be informed about
          stateObjValue - object - the new state value
         */
    addChangeListenerForName(name, listener) {
        this.ensureListenerSetupForName(name);
        smLogger(`State Manager: Adding state listener for ${name} with name ${listener.getListenerName()}`);
        const foundIndex = this.stateChangeListeners.findIndex(element => element.name === name);
        if (foundIndex >= 0) {
            smLogger(`State Manager: Adding state listener for ${name} with name ${listener.getListenerName()} with index ${foundIndex}`);
            let changeListenersForName = this.stateChangeListeners[foundIndex];
            changeListenersForName.listeners.push(listener);
        }
    }
    isEmittingEvents() {
        return !this.suppressEventEmits;
    }
    ensureListenerSetupForName(name) {
        const foundIndex = this.stateChangeListeners.findIndex(element => element.name === name);
        if (foundIndex < 0) {
            const listenersNameArrayPair = {
                name,
                listeners: [],
            };
            this.stateChangeListeners.push(listenersNameArrayPair);
        }
    }
}
//# sourceMappingURL=StateChangedDelegate.js.map