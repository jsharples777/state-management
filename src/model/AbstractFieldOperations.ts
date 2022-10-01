import {FieldFormatter, FieldRenderer, FieldValidator, ValidationResponse} from "../CommonTypes";
import {FieldDefinition, FieldValueGenerator} from "./DataObjectTypeDefs";
import {Field} from "../ui/field/Field";

export abstract class AbstractFieldOperations implements FieldFormatter, FieldRenderer, FieldValidator, FieldValueGenerator {
    abstract formatValue(field: FieldDefinition, currentValue: string): any;

    abstract generate(field: FieldDefinition, isCreate: boolean): string ;

    abstract isValidValue(field: FieldDefinition, currentValue: string | null): ValidationResponse ;

    abstract renderValue(field: Field | null, fieldDef: FieldDefinition, currentValue: string): string | null ;

    abstract setSubElements(elements: HTMLInputElement[]): void ;

}
