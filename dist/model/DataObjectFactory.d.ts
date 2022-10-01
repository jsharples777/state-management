import { DataObject } from "./DataObject";
import { DataObjectDefinition } from "./DataObjectTypeDefs";
import { AbstractFieldOperations } from "./AbstractFieldOperations";
export declare class DataObjectFactory {
    private static _instance;
    private static fieldOps;
    private constructor();
    static getInstance(): DataObjectFactory;
    createDataObjectFromDataAndDef(def: DataObjectDefinition, data: any, isComplete?: boolean, fieldOps?: AbstractFieldOperations): DataObject;
    createDataObjectFromData(stateName: string, data: any, isComplete?: boolean, fieldOps?: AbstractFieldOperations): DataObject | any;
    createDataObjectsFromStateNameAndData(stateName: string, datas: any[], isComplete?: boolean, fieldOps?: AbstractFieldOperations): DataObject[] | any[];
    instance(def: DataObjectDefinition, fieldOps?: AbstractFieldOperations): DataObject;
}
