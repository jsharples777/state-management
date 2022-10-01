import { FieldDefinition } from "./model/DataObjectTypeDefs";
import { Field } from "./ui/field/Field";
import { FieldValueOptions } from "./model/CommonTypes";
export declare enum ElementLocation {
    top = 0,
    bottom = 1,
    left = 2,
    right = 3,
    none = -1
}
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
export declare type ExtraAction = {
    name: string;
    button: BasicButtonElement;
    confirm: boolean;
};
export declare type FilterItem = {
    attributeName: string;
    comparison: ComparisonType;
    value: any;
    evaluator?: evaluatorFunction;
};
export declare type equalityFunction = (item1: any, item2: any) => boolean;
export declare type evaluatorFunction = (item: any, filter: FilterItem) => boolean;
export declare enum ViewMode {
    unset = -1,
    create = 0,
    update = 1,
    displayOnly = 2,
    any = 3
}
export declare type DisplayOrder = {
    fieldId: string;
    displayOrder: number;
};
export declare enum FieldLabelPosition {
    aboveField = 0,
    inlineWithField = 1,
    noLabel = 2
}
export declare type FieldRuntimeConfig = {
    fieldId: string;
    elementClasses?: string;
    containedBy?: BasicElement;
    fieldDimensions?: {
        columnSpan: number;
        spacingClasses?: string;
    };
    label?: {
        label?: string;
        labelPosition: FieldLabelPosition;
    };
    editor?: FieldEditor;
    renderer?: FieldRenderer;
    validator?: FieldValidator;
    extraActions?: ExtraAction[];
    fieldIsEditableInTable?: UndefinedBoolean;
};
export declare type ValidationResponse = {
    isValid: boolean;
    message?: string;
    resetOnFailure: boolean;
};
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
export declare enum UIFieldType {
    checkbox = 0,
    email = 1,
    hidden = 2,
    number = 3,
    password = 4,
    text = 5,
    textarea = 6,
    select = 7,
    radioGroup = 8,
    tableData = 9,
    list = 10,
    composite = 11,
    linked = 12,
    linkedList = 13
}
export declare type FieldLabel = {
    label: string;
    attributes?: Attribute[];
    classes?: string;
};
export declare type DescriptionText = {
    message: string;
    elementType: string;
    elementClasses: string;
};
export declare type rendererFn = (fieldUIConfig: FieldUIConfig, value: string) => string;
export declare const defaultGetValue: rendererFn;
export declare type FieldUIConfig = {
    field: FieldDefinition;
    displayOrder: number;
    elementType: UIFieldType;
    elementAttributes?: Attribute[];
    elementClasses?: string;
    subElement?: {
        container?: BasicElement;
        label?: FieldLabel;
        element: BasicElement;
    };
    label?: FieldLabel;
    describedBy?: DescriptionText;
    containedBy?: BasicElement;
    textarea?: {
        rows: number;
        cols: number;
    };
    extraActions?: ExtraAction[];
    validator?: {
        validator: FieldValidator;
        messageDisplay?: BasicElement;
        validClasses?: string;
        invalidClasses?: string;
    };
    renderer?: FieldRenderer;
    editor?: FieldEditor;
    formatter?: FieldFormatter;
    conditionalDisplay?: ConditionalField;
    datasource?: FieldValueOptions;
    getValue: rendererFn;
};
export declare type FieldGroup = {
    containedBy?: BasicElement;
    subGroups?: FieldGroup[];
    fields: FieldUIConfig[];
};
export declare type FieldRuntimeGroup = {
    containedBy?: BasicElement;
    subGroups?: FieldRuntimeGroup[];
    fields: string[];
};
export declare type AttributeFieldMapItem = {
    fieldId: string;
    attributeId: string;
};
export declare const DATA_ID_ATTRIBUTE: string;
export declare type Attribute = {
    name: string;
    value: string;
};
export declare type ModifierClasses = {
    normal: string;
    inactive: string;
    active: string;
    warning: string;
};
export declare type IconClasses = {
    normal: string;
    inactive?: string;
    active?: string;
    warning?: string;
};
export declare type BasicButtonElement = {
    classes: string;
    text?: string;
    iconClasses?: string;
    attributes?: Attribute[];
};
export declare type BasicElement = {
    type: string;
    attributes?: Attribute[];
    classes: string;
    innerHTML?: string;
};
export declare const DRAGGABLE_KEY_ID: string;
export declare const DRAGGABLE_TYPE: string;
export declare const DRAGGABLE_FROM: string;
export declare type Draggable = {
    type: string;
    from: string;
};
export declare type Droppable = {
    acceptTypes: string[];
    acceptFrom?: string[];
};
export declare enum ItemEventType {
    SHOWN = "shown",
    HIDDEN = "hidden",
    CANCELLING = "cancelling",
    CANCELLING_ABORTED = "cancelling-aborted",
    CANCELLED = "cancelled",
    SAVING = "saving",
    SAVE_ABORTED = "save-aborted",
    SAVED = "saved",
    DELETING = "deleting",
    DELETE_ABORTED = "delete-aborted",
    DELETED = "deleted",
    CREATING = "creating",
    MODIFYING = "modifying",
    DISPLAYING_READ_ONLY = "readonly",
    RESETTING = "reset",
    COMPOSITE_EDIT = "composite-edit",
    COMPOSITE_ARRAY_EDIT = "composite-array-edit",
    LINKED_EDIT = "linked-edit",
    LINKED_ARRAY_EDIT = "linked-array-edit",
    FIELD_ACTION = "field-action"
}
export interface DocumentLoaded {
    onDocumentLoaded(): void;
}
export declare enum BasicKeyAction {
    ok = "OK",
    cancel = "Cancel"
}
