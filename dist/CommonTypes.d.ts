import { FieldDefinition } from "./model/DataObjectTypeDefs";
import { Field } from "./ui/field/Field";
export declare enum UndefinedBoolean {
    true = 1,
    false = 0
}
export declare enum ComparisonType {
    equals = 0,
    lessThan = 1,
    lessThanEqual = 2,
    greaterThan = 3,
    greaterThanEqual = 4,
    isNull = 5,
    isNotNull = 6,
    hasValue = 7,
    isNotValue = 8
}
export declare type FilterItem = {
    attributeName: string;
    comparison: ComparisonType;
    value: any;
    evaluator?: evaluatorFunction;
};
export declare type equalityFunction = (item1: any, item2: any) => boolean;
export declare type evaluatorFunction = (item: any, filter: FilterItem) => boolean;
export declare type DisplayOrder = {
    fieldId: string;
    displayOrder: number;
};
export declare type ValidationResponse = {
    isValid: boolean;
    message?: string;
    resetOnFailure: boolean;
};
export declare enum ViewMode {
    unset = -1,
    create = 0,
    update = 1,
    displayOnly = 2,
    any = 3
}
export declare enum KeyType {
    number = 0,
    string = 1,
    boolean = 2,
    collection = 3
}
export interface FieldValidator {
    isValidValue(field: FieldDefinition, currentValue: string | null): ValidationResponse;
    setSubElements(elements: HTMLInputElement[]): void;
}
export interface FieldFormatter {
    formatValue(field: FieldDefinition, currentValue: string): any;
    setSubElements(elements: HTMLInputElement[]): void;
}
export interface FieldRenderer {
    renderValue(field: Field | null, fieldDef: FieldDefinition, currentValue: string): string | null;
    setSubElements(elements: HTMLInputElement[]): void;
}
export interface FieldEditor {
    editValue(field: Field, fieldDef: FieldDefinition, currentValue: string): string;
    editCompleted(field: Field, fieldDef: FieldDefinition): void;
}
export interface ConditionalField {
    shouldBeVisible(field: FieldDefinition, formValues: string[]): boolean;
}
export declare const DATA_ID_ATTRIBUTE: string;
export declare type Attribute = {
    name: string;
    value: string;
};
export interface DocumentLoaded {
    onDocumentLoaded(): void;
}
