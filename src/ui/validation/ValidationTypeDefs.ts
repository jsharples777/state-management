import {ComparisonType, ViewMode} from "../../CommonTypes";
import {Field} from "../field/Field";

export enum ConditionResponse {
    show,
    hide,
    invalid,
    valid
}

export enum MultipleConditionLogic {
    onlyFailIfAllConditionsFail,
    failIfAnyConditionFails,
    failWhenTheNextInSequenceFails,
    whenAllConditionsFailRuleShouldNotBeApplied,
    failOnlyIfFinalConditionIsAFailAndPreviousConditionsAreNotFails
}

export type ValidationCondition = {
    comparison: ComparisonType,
    sourceDataFieldId?: string,
    values?: string[]
}

export type ValidationRule = {
    viewMode: ViewMode,
    targetDataFieldId: string,
    response: ConditionResponse,
    multipleConditionLogic?: MultipleConditionLogic,
    conditions?: ValidationCondition[]
}

export type RuleCheck = {
    ruleFailed: boolean,
    message?: string,
    index?: number
}

export type RuleResponse = {
    field: Field,
    ruleFailed: boolean,
    response: ConditionResponse,
    message?: string
}
