import { ConditionResponse, ValidationCondition, ValidationRule } from "./ValidationTypeDefs";
import { Field } from "../field/Field";
import { FieldDefinition } from "../../model/DataObjectTypeDefs";
import { FieldListener } from "../field/FieldListener";
import { ComparisonType, ViewMode } from "../../CommonTypes";
import { ViewFieldValidator } from "./ViewFieldValidator";
import { ValidatableView } from "./ValidatableView";
export declare type RuleCheck = {
    ruleFailed: boolean;
    message?: string;
    index?: number;
};
export declare type RuleResponse = {
    field: Field;
    ruleFailed: boolean;
    response: ConditionResponse;
    message?: string;
};
declare type _Condition = {
    sourceField?: Field;
    comparison: ComparisonType;
    values?: string[];
};
export declare class ValidationManager implements FieldListener, ViewFieldValidator {
    private static _instance;
    private viewRules;
    private viewValidators;
    private constructor();
    static getInstance(): ValidationManager;
    addViewValidator(validator: ViewFieldValidator): void;
    getName(): string;
    addRuleToView(validatableView: ValidatableView, rule: ValidationRule): void;
    failedValidation(view: ValidatableView, field: FieldDefinition, currentValue: string, message: string): void;
    applyRulesToTargetField(validatableView: ValidatableView, viewMode: ViewMode, field: FieldDefinition, onlyRulesOfType: ConditionResponse | null): RuleCheck;
    valueChanged(view: ValidatableView, field: Field, fieldDef: FieldDefinition, newValue: string | null): void;
    protected createRuleCondition(validatableView: ValidatableView, targetField: Field, rule: ValidationRule, condition: ValidationCondition): _Condition | null;
    protected canCompareSourceAndTarget(validatableView: ValidatableView, rule: ValidationRule, sourceField: Field, targetField?: Field): boolean;
    private executeRule;
    private getRulesForFieldChange;
}
export {};
