import debug from "debug";
const logger = debug('data-object-persistence-manager');
export class DataObjectPersistenceManager {
    constructor() {
        this.typeManagers = [];
    }
    static getInstance() {
        if (!(DataObjectPersistenceManager._instance)) {
            DataObjectPersistenceManager._instance = new DataObjectPersistenceManager();
        }
        return DataObjectPersistenceManager._instance;
    }
    addStateManagerForDataObjectType(type, manager) {
        this.typeManagers.push({ type, manager });
    }
    persist(dataObj) {
        // can only persist complete and changed objects
        logger(`Persisting data object ${dataObj.toString()}`);
        if (dataObj.isComplete() && dataObj.hasChanged()) {
            const def = dataObj.getDefinition();
            const foundIndex = this.typeManagers.findIndex((managerForType) => managerForType.type === def.id);
            if (foundIndex >= 0) {
                const stateManager = this.typeManagers[foundIndex].manager;
                if (dataObj.isNew()) {
                    stateManager.addNewItemToState(def.id, dataObj.getData(), false);
                }
                else {
                    stateManager.updateItemInState(def.id, dataObj.getData(), false);
                }
                dataObj.setPersisted(true);
            }
            else {
                logger(`Persisting data object ${dataObj.toString()} - NOT PERFORMED - no configured state manager for type ${def.id}`);
            }
        }
        else {
            logger(`Persisting data object ${dataObj.toString()} - NOT PERFORMED - not complete or no changes`);
        }
    }
    delete(dataObj) {
        // can only delete complete
        logger(`Deleting data object ${dataObj.toString()}`);
        if (dataObj.isComplete()) {
            const def = dataObj.getDefinition();
            const foundIndex = this.typeManagers.findIndex((managerForType) => managerForType.type === def.id);
            if (foundIndex >= 0) {
                const stateManager = this.typeManagers[foundIndex].manager;
                stateManager.removeItemFromState(def.id, dataObj.getData(), false);
            }
            else {
                logger(`Persisting data object ${dataObj.toString()} - NOT PERFORMED - no configured state manager for type ${def.id}`);
            }
        }
        else {
            logger(`Delete data object ${dataObj.toString()} - NOT PERFORMED - not complete`);
        }
    }
}
//# sourceMappingURL=DataObjectPersistenceManager.js.map