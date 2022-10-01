import debug from "debug";
import {StateManager} from "../state/interface/StateManager";
import {DataObject} from "./DataObject";

const logger = debug('data-object-persistence-manager');

type StateManagerForType = {
    type: string,
    manager: StateManager;
}

export class DataObjectPersistenceManager {
    private static _instance: DataObjectPersistenceManager;
    protected typeManagers: StateManagerForType[];

    private constructor() {
        this.typeManagers = [];
    }

    public static getInstance(): DataObjectPersistenceManager {
        if (!(DataObjectPersistenceManager._instance)) {
            DataObjectPersistenceManager._instance = new DataObjectPersistenceManager();
        }
        return DataObjectPersistenceManager._instance;
    }

    public addStateManagerForDataObjectType(type: string, manager: StateManager): void {
        this.typeManagers.push({type, manager});
    }

    public persist(dataObj: DataObject): void {
        // can only persist complete and changed objects
        logger(`Persisting data object ${dataObj.toString()}`);
        if (dataObj.isComplete() && dataObj.hasChanged()) {
            const def = dataObj.getDefinition();
            const foundIndex = this.typeManagers.findIndex((managerForType) => managerForType.type === def.id);
            if (foundIndex >= 0) {
                const stateManager = this.typeManagers[foundIndex].manager;
                if (dataObj.isNew()) {
                    stateManager.addNewItemToState(def.id, dataObj.getData(), false);
                } else {
                    stateManager.updateItemInState(def.id, dataObj.getData(), false);
                }
                dataObj.setPersisted(true);
            } else {
                logger(`Persisting data object ${dataObj.toString()} - NOT PERFORMED - no configured state manager for type ${def.id}`);
            }
        } else {
            logger(`Persisting data object ${dataObj.toString()} - NOT PERFORMED - not complete or no changes`);
        }

    }

    public delete(dataObj: DataObject): void {
        // can only delete complete
        logger(`Deleting data object ${dataObj.toString()}`);
        if (dataObj.isComplete()) {
            const def = dataObj.getDefinition();
            const foundIndex = this.typeManagers.findIndex((managerForType) => managerForType.type === def.id);
            if (foundIndex >= 0) {
                const stateManager = this.typeManagers[foundIndex].manager;
                stateManager.removeItemFromState(def.id, dataObj.getData(), false);
            } else {
                logger(`Persisting data object ${dataObj.toString()} - NOT PERFORMED - no configured state manager for type ${def.id}`);
            }
        } else {
            logger(`Delete data object ${dataObj.toString()} - NOT PERFORMED - not complete`);
        }

    }

}
