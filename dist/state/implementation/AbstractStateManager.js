import debug from 'debug';
import { StateEventType, StateManagerType } from "../interface/StateManager";
import { StateChangedDelegate } from "../delegate/StateChangedDelegate";
import { ComparisonType } from "../../CommonTypes";
import { StateContextDelegate } from "../delegate/StateContextDelegate";
import { MatchLogicType } from "../../filter/Types";
import { CollectionFilterProcessor } from "../../filter/CollectionFilterProcessor";
const smLogger = debug('state-manager-ts');
const smLoggerDetail = debug('state-manager-ts:detail');
export class AbstractStateManager {
    constructor(managerName, defaultEquality, fnPerState = null) {
        this.forceSaves = true;
        this.managerName = '';
        this.equalityFns = null;
        this.contextDelegate = null;
        this.delegate = new StateChangedDelegate(managerName);
        this.managerName = managerName;
        this.defaultEquality = defaultEquality;
        if (fnPerState) {
            this.equalityFns = fnPerState;
        }
        this.emitEvents();
        this.forceSaves = true;
    }
    setContextSupplier(name, supplier) {
        this.contextDelegate = new StateContextDelegate(this, name, supplier);
    }
    stateContextChanged(newContext) {
    }
    receivedFilterResults(name, filterResults) {
        this.delegate.informChangeListenersForStateWithName(name, filterResults, StateEventType.FilterResults, null);
    }
    receivedFoundItem(name, foundItem) {
        this.delegate.informChangeListenersForStateWithName(name, foundItem, StateEventType.FindItem, null);
    }
    suppressEvents() {
        this.delegate.suppressEvents();
    }
    emitEvents() {
        this.delegate.emitEvents();
    }
    dontForceSavesOnAddRemoveUpdate() {
        this.forceSaves = false;
    }
    forceSavesOnAddRemoveUpdate() {
        this.forceSaves = true;
    }
    informChangeListenersForStateWithName(name, stateObjValue, eventType = StateEventType.StateChanged, previousObjValue = null) {
        this.delegate.informChangeListenersForStateWithName(name, stateObjValue, eventType, previousObjValue);
    }
    addChangeListenerForName(name, listener) {
        this.delegate.addChangeListenerForName(name, listener);
    }
    _findItemInState(name, item) {
        let result = {};
        const state = this.getStateByName(name);
        const foundIndex = state.findIndex((element) => this.getEqualityFnForName(name)(element, item));
        smLogger(`Finding item in state ${name} - found index ${foundIndex}`);
        smLogger(item);
        if (foundIndex >= 0) {
            result = state[foundIndex];
        }
        return result;
    }
    _findItemsInState(name, filters) {
        let results = [];
        const state = this._getState(name);
        try {
            // convert the FilterItem to the collection view processor filter
            const collectionFilter = {
                conditionMatch: [],
                conditionalMatchLogicType: MatchLogicType.AND,
                contains: [],
                exactMatch: [],
                exactMatchLogicType: MatchLogicType.AND
            };
            filters.forEach((filter) => {
                if (filter.comparison === ComparisonType.equals) {
                    const collectionFilterItem = {
                        isStrictMatch: true,
                        matchValues: [filter.value],
                        matchingFieldId: filter.attributeName
                    };
                    collectionFilter.exactMatch.push(collectionFilterItem);
                }
                else {
                    const collectionFilterItem = {
                        condition: filter.comparison,
                        isStrictMatch: false,
                        matchValue: filter.value,
                        matchingFieldId: filter.attributeName
                    };
                    collectionFilter.conditionMatch.push(collectionFilterItem);
                }
            });
            results = CollectionFilterProcessor.getFilteredState(name, state.value, collectionFilter, true);
        }
        catch (err) {
            smLogger(`filter, state value for ${state.name} is not any array`);
        }
        smLoggerDetail('Match results');
        smLoggerDetail(results);
        return results;
    }
    addStateByName(name, stateObjForName) {
        this._ensureStatePresent(name);
        /* create a new state attribute for the application state */
        const state = {
            name,
            value: stateObjForName,
            hasBeenSet: true
        };
        /* get the current state value and replace it */
        this._replaceNamedStateInStorage(state);
        this.informChangeListenersForStateWithName(name, stateObjForName, StateEventType.StateChanged);
        return stateObjForName;
    }
    getStateByName(name) {
        this._ensureStatePresent(name);
        smLogger(`State Manager: Getting state for ${name}`);
        let stateValueObj = {};
        // get the current state
        const state = this._getState(name);
        stateValueObj = state.value;
        smLogger(`State Manager: Found previous state for ${name}`);
        smLogger(stateValueObj);
        return stateValueObj;
    }
    setStateByName(name, stateObjectForName, informListeners = true) {
        this._ensureStatePresent(name);
        smLogger(`State Manager: Setting state for ${name}`);
        smLogger(stateObjectForName);
        // set the current state
        const state = this._getState(name);
        state.value = stateObjectForName;
        state.hasBeenSet = true;
        if (this.forceSaves)
            this._saveState(name, stateObjectForName);
        if (informListeners)
            this.informChangeListenersForStateWithName(name, stateObjectForName);
        return stateObjectForName;
    }
    addNewItemToState(name, item, isPersisted = false) {
        this._ensureStatePresent(name);
        smLogger(`State Manager: Adding item to state ${name}`);
        // const state = this.getStateByName(name);
        // state.push(item);
        // smLogger(state);
        this._addItemToState(name, item, isPersisted);
        this.informChangeListenersForStateWithName(name, item, StateEventType.ItemAdded);
    }
    findItemInState(name, item) {
        this._ensureStatePresent(name);
        return this._findItemInState(name, item);
    }
    isItemInState(name, item) {
        this._ensureStatePresent(name);
        let result = false;
        const state = this.getStateByName(name);
        const foundIndex = state.findIndex((element) => this.getEqualityFnForName(name)(element, item));
        if (foundIndex >= 0) {
            result = true;
        }
        return result;
    }
    removeItemFromState(name, item, isPersisted) {
        this._ensureStatePresent(name);
        let result = true;
        let oldItem = this.findItemInState(name, item);
        // remove the item from the state
        smLogger(`State Manager: Found item - removing, is persisted ${isPersisted}`);
        this._removeItemFromState(name, item, isPersisted);
        this.informChangeListenersForStateWithName(name, oldItem, StateEventType.ItemDeleted);
        return result;
    }
    updateItemInState(name, item, isPersisted) {
        this._ensureStatePresent(name);
        let result = true;
        let oldItem = this.findItemInState(name, item);
        smLogger('State Manager: Found item - replacing ');
        this._updateItemInState(name, item, isPersisted);
        this.informChangeListenersForStateWithName(name, item, StateEventType.ItemUpdated, oldItem);
        return result;
    }
    findItemsInState(name, filters) {
        this._ensureStatePresent(name);
        return this._findItemsInState(name, filters);
    }
    getType() {
        return StateManagerType.Local;
    }
    fireStateChanged(name) {
        if (this.isEmittingEvents()) {
            this._ensureStatePresent(name);
            const state = this.getStateByName(name);
            if (state) {
                this.delegate.informChangeListenersForStateWithName(name, state.value, StateEventType.StateChanged, null);
            }
        }
    }
    isEmittingEvents() {
        return this.delegate.isEmittingEvents();
    }
    getEqualityFnForName(name) {
        let result = this.defaultEquality;
        if (this.equalityFns) {
            const foundIndex = this.equalityFns.findIndex((fn) => fn.name === name);
            if (foundIndex >= 0)
                result = this.equalityFns[foundIndex].equality;
        }
        return result;
    }
}
//# sourceMappingURL=AbstractStateManager.js.map