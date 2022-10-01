import {DataObject} from "./DataObject";
import {DataObjectDefinition, FieldType} from "./DataObjectTypeDefs";
import {BasicFieldOperations} from "./BasicFieldOperations";
import {AbstractFieldOperations} from "./AbstractFieldOperations";
import {DefaultDataObject} from "./DefaultDataObject";
import {ObjectDefinitionRegistry} from "./ObjectDefinitionRegistry";
import debug from 'debug';
import {DefinitionNotFoundError} from "./DefinitionNotFoundError";

const logger = debug('data-object-factory');

export class DataObjectFactory {
    private static _instance: DataObjectFactory;
    private static fieldOps: AbstractFieldOperations;

    private constructor() {
        DataObjectFactory.fieldOps = new BasicFieldOperations();

    }

    public static getInstance(): DataObjectFactory {
        if (!(DataObjectFactory._instance)) {
            DataObjectFactory._instance = new DataObjectFactory();
        }
        return DataObjectFactory._instance;
    }

    public createDataObjectFromDataAndDef(def: DataObjectDefinition, data: any, isComplete?: boolean, fieldOps?: AbstractFieldOperations): DataObject {
        let result: DataObject;
        let localFieldOps: AbstractFieldOperations;
        if (fieldOps) {
            localFieldOps = fieldOps;
        } else {
            localFieldOps = DataObjectFactory.fieldOps;
        }
        result = new DefaultDataObject(def, data, localFieldOps);
        if (isComplete) {
            result.setComplete();
        }
        return result;
    }

    public createDataObjectFromData(stateName: string, data: any, isComplete?: boolean, fieldOps?: AbstractFieldOperations): DataObject | any {
        const def = ObjectDefinitionRegistry.getInstance().findDefinition(stateName);
        if (def) {
            let localData = {};
            if (data) {
                localData = data;
            }
            return this.createDataObjectFromDataAndDef(def, localData, isComplete, fieldOps);
        } else {
            logger(`Not definition found for state name ${stateName}`);
            return data;
        }
    }

    public createDataObjectsFromStateNameAndData(stateName: string, datas: any[], isComplete?: boolean, fieldOps?: AbstractFieldOperations): DataObject[] | any[] {
        let results: DataObject[] = [];
        const def = ObjectDefinitionRegistry.getInstance().findDefinition(stateName);
        if (def) {
            if (datas) {
                datas.forEach((data) => {
                    results.push(this.createDataObjectFromDataAndDef(def, data, isComplete, fieldOps));

                });
            }
        } else {
            logger(`Not definition found for state name ${stateName}`);
            results = datas;
        }


        return results;
    }

    public instance(def: DataObjectDefinition, fieldOps?: AbstractFieldOperations): DataObject {
        logger(`Creating instance for definition ${def.id}`);
        let data: any = {};
        let localFieldOps = DataObjectFactory.fieldOps;
        if (fieldOps) {
            localFieldOps = fieldOps;
        }

        def.fields.forEach((fieldDef) => {
            if (fieldDef.generator && fieldDef.generator.onCreation) {
                let fieldValue = fieldDef.generator.generator.generate(fieldDef, true);

                switch (fieldDef.type) {
                    case (FieldType.date):
                    case (FieldType.datetime): {
                        break;
                    }
                    default: {
                        fieldValue = localFieldOps.formatValue(fieldDef, fieldValue);
                        break;
                    }
                }

                logger(`Setting default values for ${fieldDef.displayName} to ${fieldValue}`);
                data[fieldDef.id] = fieldValue;
            }
            if (fieldDef.type === FieldType.compositeObject) {
                if (fieldDef.linkedDataObjectDefinitionName) {
                    const compositeDef = ObjectDefinitionRegistry.getInstance().findDefinition(fieldDef.linkedDataObjectDefinitionName);
                    if (compositeDef) {
                        const compositeDataObj = DataObjectFactory.getInstance().instance(compositeDef, localFieldOps);
                        data[fieldDef.id] = compositeDataObj;
                    } else {
                        logger(`No definition found for composite object ${fieldDef.id} with linked def ${fieldDef.linkedDataObjectDefinitionName}`);
                        throw new DefinitionNotFoundError(`No definition found for composite object ${fieldDef.id} with linked def ${fieldDef.linkedDataObjectDefinitionName}`);
                    }
                } else {
                    data[fieldDef.id] = {};
                }
            }
            if (fieldDef.type === FieldType.compositeObjectArray) {
                data[fieldDef.id] = [];
            }
            if (fieldDef.type === FieldType.linkedObject) {
                data[fieldDef.id] = ''; //will end up being uuid of a linked object
            }
            if (fieldDef.type === FieldType.linkedObjectArray) {
                data[fieldDef.id] = []; //will end up being array of uuids of a linked objects
            }
        });
        const dataObj = new DefaultDataObject(def, data, localFieldOps);
        dataObj.setPersisted(false);
        dataObj.setNew();

        return dataObj;

    }

}
