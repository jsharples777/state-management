import {FieldDefinition} from "../../model/DataObjectTypeDefs";
import {Field} from "./Field";
import {ValidatableView} from "../validation/ValidatableView";

export interface FieldListener {
    getName(): string;

    valueChanged(view: ValidatableView, field: Field, fieldDef: FieldDefinition, newValue: string | null): void;

    failedValidation(view: ValidatableView, field: FieldDefinition, currentValue: string, message: string): void;
}
