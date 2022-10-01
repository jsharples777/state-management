import {FieldDefinition} from "./model/DataObjectTypeDefs";
import {Field} from "./ui/field/Field";
import {FieldValueOptions} from "./model/CommonTypes";

export enum ElementLocation {
    top,
    bottom,
    left,
    right,
    none = -1
}

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

export type ExtraAction = {
    name: string,
    button: BasicButtonElement,
    confirm: boolean
}

export type FilterItem = {
    attributeName: string,
    comparison: ComparisonType,
    value: any,
    evaluator?: evaluatorFunction
}

export type equalityFunction = (item1: any, item2: any) => boolean;
export type evaluatorFunction = (item: any, filter: FilterItem) => boolean;

export enum ViewMode {
    unset = -1,
    create,
    update,
    displayOnly,
    any
}

export type DisplayOrder = {
    fieldId: string,
    displayOrder: number
}

export enum FieldLabelPosition {
    aboveField,
    inlineWithField,
    noLabel
}

export type FieldRuntimeConfig = {
    fieldId: string,
    elementClasses?: string,
    containedBy?: BasicElement,
    fieldDimensions?: {
        columnSpan: number,
        spacingClasses?: string
    }
    label?: {
        label?: string,
        labelPosition: FieldLabelPosition
    },
    editor?: FieldEditor,
    renderer?: FieldRenderer,
    validator?: FieldValidator,
    extraActions?: ExtraAction[],
    fieldIsEditableInTable?: UndefinedBoolean
}

export type ValidationResponse = {
    isValid: boolean,
    message?: string,
    resetOnFailure: boolean
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

export enum UIFieldType {
    checkbox,
    email,
    hidden,
    number,
    password,
    text,
    textarea,
    select,
    radioGroup,
    tableData,
    list,
    composite,
    linked,
    linkedList,
}

export type FieldLabel = {
    label: string,
    attributes?: Attribute[],
    classes?: string
}

export type DescriptionText = {
    message: string,
    elementType: string,
    elementClasses: string,
}


export type rendererFn = (fieldUIConfig: FieldUIConfig, value: string) => string;

export const defaultGetValue: rendererFn = (fieldUIConfig: FieldUIConfig, currentValue: string) => {
    let result = currentValue;
    if (fieldUIConfig.renderer) {
        let value = fieldUIConfig.renderer.renderValue(null, fieldUIConfig.field, currentValue);
        if (value) result = value;
    }
    if (!result) {
        result = '';
    }
    return result;
}


export type FieldUIConfig = {
    field: FieldDefinition,
    displayOrder: number,
    elementType: UIFieldType,
    elementAttributes?: Attribute[],
    elementClasses?: string,
    subElement?: {
        container?: BasicElement,
        label?: FieldLabel,
        element: BasicElement,
    },// for radio and selection options
    label?: FieldLabel,
    describedBy?: DescriptionText,
    containedBy?: BasicElement,
    textarea?: {
        rows: number,
        cols: number
    },
    extraActions?: ExtraAction[],
    validator?: {
        validator: FieldValidator, // on blur
        messageDisplay?: BasicElement,
        validClasses?: string,
        invalidClasses?: string,
    },
    renderer?: FieldRenderer, // on change
    editor?: FieldEditor, // on focus
    formatter?: FieldFormatter // used by form when saving
    conditionalDisplay?: ConditionalField // used to determine if the is visible
    datasource?: FieldValueOptions,
    getValue: rendererFn
}

export type FieldGroup = {
    containedBy?: BasicElement,
    subGroups?: FieldGroup[],
    fields: FieldUIConfig[]
}

export type FieldRuntimeGroup = {
    containedBy?: BasicElement,
    subGroups?: FieldRuntimeGroup[],
    fields: string[]
}

export type AttributeFieldMapItem = {
    fieldId: string,
    attributeId: string
}

export const DATA_ID_ATTRIBUTE: string = 'data-id';

export type Attribute = {
    name: string,
    value: string
}

export type ModifierClasses = {
    normal: string,
    inactive: string,
    active: string,
    warning: string
}

export type IconClasses = {
    normal: string,
    inactive?: string,
    active?: string,
    warning?: string,
}

export type BasicButtonElement = {
    classes: string,
    text?: string,
    iconClasses?: string,
    attributes?: Attribute[]

}

export type BasicElement = {
    type: string,
    attributes?: Attribute[],
    classes: string,
    innerHTML?: string
}

export const DRAGGABLE_KEY_ID: string = 'text/plain';
export const DRAGGABLE_TYPE: string = 'draggedType';
export const DRAGGABLE_FROM: string = 'draggedFrom';

export type Draggable = {
    type: string,
    from: string
}

export type Droppable = {
    acceptTypes: string[];
    acceptFrom?: string[];
}

//export type getIcons = (name: string, item: any) => string[];

export enum ItemEventType {
    SHOWN = 'shown',
    HIDDEN = 'hidden',
    CANCELLING = 'cancelling',
    CANCELLING_ABORTED = 'cancelling-aborted',
    CANCELLED = 'cancelled',
    SAVING = 'saving',
    SAVE_ABORTED = 'save-aborted',
    SAVED = 'saved',
    DELETING = 'deleting',
    DELETE_ABORTED = 'delete-aborted',
    DELETED = 'deleted',
    CREATING = 'creating',
    MODIFYING = 'modifying',
    DISPLAYING_READ_ONLY = 'readonly',
    RESETTING = 'reset',
    COMPOSITE_EDIT = 'composite-edit',
    COMPOSITE_ARRAY_EDIT = 'composite-array-edit',
    LINKED_EDIT = 'linked-edit',
    LINKED_ARRAY_EDIT = 'linked-array-edit',
    FIELD_ACTION = 'field-action',
}

export interface DocumentLoaded {
    onDocumentLoaded(): void;
}

export enum BasicKeyAction {
    ok = 'OK',
    cancel = 'Cancel'
}
