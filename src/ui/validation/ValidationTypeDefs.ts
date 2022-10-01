import {ComparisonType, ViewMode} from "../../CommonTypes";

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
