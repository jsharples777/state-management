import { Field } from "../field/Field";
import { FieldType } from "../../model/DataObjectTypeDefs";
import { ComparisonType } from "../../CommonTypes";
import { RuleCheck } from "./ValidationTypeDefs";
export declare class ValidationHelperFunctions {
    private static _instance;
    constructor();
    static getInstance(): ValidationHelperFunctions;
    areTwoFieldsEqual(targetField: Field, sourceField: Field): RuleCheck;
    isFieldAndValueEqual(field: Field, value: string): RuleCheck;
    compareTwoValuesWithTypes(targetType: FieldType, targetValue: string | null, sourceType: FieldType, sourceValue: string | null, comparison: ComparisonType): boolean;
    isTargetLessThanSource(targetField: Field, sourceField: Field): RuleCheck;
    isFieldLessThanValue(field: Field, value: string): RuleCheck;
    isFieldLessThanEqualValue(field: Field, value: string): RuleCheck;
    isFieldGreaterThanValue(field: Field, value: string): RuleCheck;
    isFieldGreaterThanEqualValue(field: Field, value: string): RuleCheck;
    isTargetLessThanEqualSource(targetField: Field, sourceField: Field): RuleCheck;
    isTargetGreaterThan(targetField: Field, sourceField: Field): RuleCheck;
    isFieldNull(sourceField: Field): RuleCheck;
    isFieldNotNull(field: Field): RuleCheck;
    doesFieldHaveValue(field: Field, values: string[]): RuleCheck;
    doesSourceFieldHaveValue(field: Field, values: string[]): RuleCheck;
    isFieldNotValue(field: Field, values: string[]): RuleCheck;
    sourceFieldIsNotValue(field: Field, values: string[]): RuleCheck;
    isTargetGreaterThanEqualSource(targetField: Field, sourceField: Field): RuleCheck;
    compareFields(targetField: Field, sourceField: Field, comparison: ComparisonType, value: string[]): RuleCheck;
    compareFieldWithValue(field: Field, comparison: ComparisonType, value: string[]): RuleCheck;
}
