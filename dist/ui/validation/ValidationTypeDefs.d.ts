import { ComparisonType, ViewMode } from "../../CommonTypes";
import { Field } from "../field/Field";
export declare enum ConditionResponse {
    show = 0,
    hide = 1,
    invalid = 2,
    valid = 3
}
export declare enum MultipleConditionLogic {
    onlyFailIfAllConditionsFail = 0,
    failIfAnyConditionFails = 1,
    failWhenTheNextInSequenceFails = 2,
    whenAllConditionsFailRuleShouldNotBeApplied = 3,
    failOnlyIfFinalConditionIsAFailAndPreviousConditionsAreNotFails = 4
}
export declare type ValidationCondition = {
    comparison: ComparisonType;
    sourceDataFieldId?: string;
    values?: string[];
};
export declare type ValidationRule = {
    viewMode: ViewMode;
    targetDataFieldId: string;
    response: ConditionResponse;
    multipleConditionLogic?: MultipleConditionLogic;
    conditions?: ValidationCondition[];
};
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
