import debug from 'debug';
import { AbstractStateManager } from "./AbstractStateManager";
const aggLogger = debug('state-manager-aggregate');
export class AggregateStateManager extends AbstractStateManager {
    constructor(defaultEq, equalityFns = null) {
        super('aggregate', defaultEq, equalityFns);
        this.stateManagers = [];
        this.emitEvents();
    }
    getAvailableStateNames() {
        let result = [];
        if (this.stateManagers.length > 0) {
            const manager = this.stateManagers[0].manager;
            result = manager.getAvailableStateNames();
        }
        return result;
    }
    fireStateChangedForAllStates() {
        if (this.stateManagers.length > 0) {
            const manager = this.stateManagers[0].manager;
            const stateNames = this.getAvailableStateNames();
            stateNames.forEach((name) => {
                const state = manager._getState(name);
                this.informChangeListenersForStateWithName(name, state.value);
            });
        }
    }
    addStateManager(stateManager, filters = [], emitEvents) {
        let mWF = {
            manager: stateManager,
            filters: filters
        };
        this.stateManagers.push(mWF);
        if (!emitEvents)
            stateManager.suppressEvents();
        aggLogger('adding state manager with/without filters');
    }
    _addNewNamedStateToStorage(state) {
        this.stateManagers.forEach((managerWithFilters) => {
            if (!this.stateNameInFilters(state.name, managerWithFilters.filters)) {
                managerWithFilters.manager._addNewNamedStateToStorage(state);
            }
        });
    }
    _getState(name) {
        let state = {
            name: name,
            value: [],
            hasBeenSet: false
        };
        this.stateManagers.forEach((sm) => {
            if (!this.stateNameInFilters(state.name, sm.filters)) {
                aggLogger(`get state from state manager for state ${name}`);
                aggLogger(sm.manager);
                sm.manager._getState(name);
            }
        });
        // assuming the state manager is holding all the values
        if (this.stateManagers.length > 0) {
            state = this.stateManagers[0].manager._getState(name);
        }
        return state;
    }
    _ensureStatePresent(name) {
        this.stateManagers.forEach((managerWithFilters) => {
            if (!this.stateNameInFilters(name, managerWithFilters.filters)) {
                managerWithFilters.manager._ensureStatePresent(name);
            }
        });
    }
    _replaceNamedStateInStorage(state) {
        this.stateManagers.forEach((managerWithFilters) => {
            if (!this.stateNameInFilters(state.name, managerWithFilters.filters)) {
                managerWithFilters.manager._replaceNamedStateInStorage(state);
            }
        });
    }
    _saveState(name, stateObj) {
        this.stateManagers.forEach((managerWithFilters) => {
            if (!this.stateNameInFilters(name, managerWithFilters.filters)) {
                aggLogger(`saving state in state manager for state ${name}`);
                aggLogger(managerWithFilters.manager);
                aggLogger(stateObj);
                managerWithFilters.manager._saveState(name, stateObj);
            }
        });
    }
    _addItemToState(name, stateObj, isPersisted = false) {
        this.stateManagers.forEach((managerWithFilters) => {
            if (!this.stateNameInFilters(name, managerWithFilters.filters)) {
                aggLogger(`adding item to state in  state manager for state ${name}, is persisted = ${isPersisted}`);
                aggLogger(managerWithFilters.manager);
                aggLogger(stateObj);
                managerWithFilters.manager._addItemToState(name, stateObj, isPersisted);
            }
        });
    }
    _removeItemFromState(name, stateObj, isPersisted) {
        this.stateManagers.forEach((managerWithFilters) => {
            if (!this.stateNameInFilters(name, managerWithFilters.filters)) {
                aggLogger(`removing item from state in state manager for state ${name}, is persisted = ${isPersisted}`);
                aggLogger(managerWithFilters.manager);
                aggLogger(stateObj);
                managerWithFilters.manager._removeItemFromState(name, stateObj, isPersisted);
            }
        });
    }
    _updateItemInState(name, stateObj, isPersisted) {
        this.stateManagers.forEach((managerWithFilters) => {
            if (!this.stateNameInFilters(name, managerWithFilters.filters)) {
                aggLogger(`updating item in state in  state manager for state ${name}`);
                aggLogger(managerWithFilters.manager);
                aggLogger(stateObj);
                managerWithFilters.manager._updateItemInState(name, stateObj, isPersisted);
            }
        });
    }
    _findItemsInState(name, filters) {
        // let state: StateValue = {
        //     name: name,
        //     value: []
        // }
        this.stateManagers.forEach((sm) => {
            if (!this.stateNameInFilters(name, sm.filters)) {
                aggLogger(`get state from state manager for state ${name}`);
                aggLogger(sm.manager);
                sm.manager._findItemsInState(name, filters);
            }
        });
        // assuming the state manager is holding all the values
        let results = [];
        if (this.stateManagers.length > 0) {
            results = this.stateManagers[0].manager._findItemsInState(name, filters);
        }
        return results;
    }
    _findItemInState(name, item) {
        let result = {};
        this.stateManagers.forEach((sm) => {
            if (!this.stateNameInFilters(name, sm.filters)) {
                aggLogger(`finding item from state manager for state ${name}`);
                aggLogger(sm.manager);
                sm.manager._findItemInState(name, item);
            }
        });
        // assuming the state manager is holding all the values
        if (this.stateManagers.length > 0) {
            result = this.stateManagers[0].manager._findItemInState(name, item);
        }
        return result;
    }
    stateNameInFilters(name, filters) {
        let foundIndex = filters.findIndex((filter) => filter === name);
        return (foundIndex >= 0);
    }
}
//# sourceMappingURL=AggregateStateManager.js.map