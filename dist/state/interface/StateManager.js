export var StateEventType;
(function (StateEventType) {
    StateEventType[StateEventType["ItemAdded"] = 0] = "ItemAdded";
    StateEventType[StateEventType["ItemUpdated"] = 1] = "ItemUpdated";
    StateEventType[StateEventType["ItemDeleted"] = 2] = "ItemDeleted";
    StateEventType[StateEventType["StateChanged"] = 3] = "StateChanged";
    StateEventType[StateEventType["FilterResults"] = 4] = "FilterResults";
    StateEventType[StateEventType["FindItem"] = 5] = "FindItem";
    StateEventType[StateEventType["ItemNotModified"] = 6] = "ItemNotModified";
})(StateEventType || (StateEventType = {}));
export var StateManagerType;
(function (StateManagerType) {
    StateManagerType[StateManagerType["Local"] = 0] = "Local";
    StateManagerType[StateManagerType["AsyncLocal"] = 1] = "AsyncLocal";
    StateManagerType[StateManagerType["AsyncRemote"] = 2] = "AsyncRemote";
})(StateManagerType || (StateManagerType = {}));
//# sourceMappingURL=StateManager.js.map