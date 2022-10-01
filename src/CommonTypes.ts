import {FieldDefinition} from "./model/DataObjectTypeDefs";
import {Field} from "./ui/field/Field";

export enum UndefinedBoolean {
    true = 1,
    false = 0
}

export enum ComparisonType {
    equals,
    lessThan,
    lessThanEqual,
    greaterThan,
    greaterThanEqual,
    isNull,
    isNotNull,
    hasValue,
    isNotValue
}


export type FilterItem = {
    attributeName: string,
    comparison: ComparisonType,
    value: any,
    evaluator?: evaluatorFunction
}

export type equalityFunction = (item1: any, item2: any) => boolean;
export type evaluatorFunction = (item: any, filter: FilterItem) => boolean;

// export enum ViewMode {
//     unset = -1,
//     create,
//     update,
//     displayOnly,
//     any
// }

export type DisplayOrder = {
    fieldId: string,
    displayOrder: number
}

export type ValidationResponse = {
    isValid: boolean,
    message?: string,
    resetOnFailure: boolean
}

export enum ViewMode {
    unset = -1,
    create,
    update,
    displayOnly,
    any
}

export enum KeyType {
    number,
    string,
    boolean,
    collection
}

export interface FieldValidator {  // is the current value valid (includes manndatory checks)
    isValidValue(field: FieldDefinition, currentValue: string | null): ValidationResponse;

    setSubElements(elements: HTMLInputElement[]): void;
}

export interface FieldFormatter { // final value for the field on "saving" the form
    formatValue(field: FieldDefinition, currentValue: string): any;

    setSubElements(elements: HTMLInputElement[]): void;
}

export interface FieldRenderer { // renders during user changes
    renderValue(field: Field | null, fieldDef: FieldDefinition, currentValue: string): string | null;

    setSubElements(elements: HTMLInputElement[]): void;
}

export interface FieldEditor { // allows for an "editor" component
    editValue(field: Field, fieldDef: FieldDefinition, currentValue: string): string;

    editCompleted(field: Field, fieldDef: FieldDefinition): void;
}

export interface ConditionalField { // a field may not be visible based on other field values
    shouldBeVisible(field: FieldDefinition, formValues: string[]): boolean;
}


export const DATA_ID_ATTRIBUTE: string = 'data-id';

export type Attribute = {
    name: string,
    value: string
}

export interface DocumentLoaded {
    onDocumentLoaded(): void;
}

