import { FieldDefinition } from "./DataObjectTypeDefs";
import { Field } from "../ui/field/Field";
import { ValidationResponse } from "../CommonTypes";
import { AbstractFieldOperations } from "./AbstractFieldOperations";
export declare class BasicFieldOperations extends AbstractFieldOperations {
    private static dateRegex;
    private static emailRegex;
    private static shortTimeRegex;
    private static timeRegex;
    private static dateTimeRegex;
    private static basicPasswordRegex;
    private static integerRegex;
    private static floatRegexp;
    private static booleanRegexp;
    private static durationRegexp;
    private static colourRegexp;
    private static _instance;
    constructor();
    static getInstance(): BasicFieldOperations;
    setSubElements(elements: HTMLInputElement[]): void;
    formatValue(field: FieldDefinition, currentValue: string): any;
    isValidValue(field: FieldDefinition, currentValue: string | null): ValidationResponse;
    renderValue(field: Field | null, fieldDef: FieldDefinition, currentValue: string): string | null;
    generate(field: FieldDefinition, isCreate: boolean): string;
    private generateValue;
}
