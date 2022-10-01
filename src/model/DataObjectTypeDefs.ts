import {FieldValueOptions} from "./CommonTypes";
import {ValidationRule} from "../ui/validation/ValidationTypeDefs";
import {DataObject} from "./DataObject";
import {KeyType} from '../CommonTypes';


export enum FieldType {
    id = 'Id',
    uuid = 'UUID',
    text = 'Text',
    integer = 'Integer',
    float = 'Number',
    date = 'Date',
    time = 'Time',
    shortTime = 'Short Time',
    datetime = 'Datetime',
    email = 'Email',
    password = 'Password',
    boolean = 'True/False',
    userId = 'User',
    choice = 'Choice',
    limitedChoice = 'Limited Choice',
    largeText = 'TextArea',
    duration = 'Duration',
    colour = 'Colour',
    compositeObject = 'Sub Object',
    compositeObjectArray = 'Sub Object Array',
    linkedObject = 'Linked Object',
    linkedObjectArray = 'Linked Object Array',
    ANY = 'ANY',
}

export interface FieldValueGenerator {
    generate(field: FieldDefinition, isCreate: boolean): string;
}

export interface DerivedField {
    getValue(dataObj: any, field: FieldDefinition, isCreate: boolean): string;

    setValue(dataObj: any, field: FieldDefinition, isCreate: boolean, value: string): string;

    onlyForDisplay(): boolean;
}


export type FieldDefinition = {
    id: string,
    isKey: boolean,
    idType: KeyType,
    type: FieldType,
    displayName: string,
    mandatory: boolean,
    sortable?: boolean,
    displayOnly?: boolean,
    description?: string,
    linkedDataObjectDefinitionName?: string,
    generator?: {
        onCreation: boolean,
        onModify: boolean,
        generator: FieldValueGenerator
    },
    dataSource?: FieldValueOptions,
    derivedValue?: DerivedField
}

export interface DataObjectStringifier {
    toString(dataObj: DataObject): string;

    getDescription(dataObj: DataObject): string;
}


export type DataObjectDefinition = {
    id: string,
    displayName: string,
    convertToString: DataObjectStringifier,
    fields: FieldDefinition[],
    rules?: ValidationRule
}



