import {ComparisonType, evaluatorFunction} from "../CommonTypes";

export enum MatchLogicType {
    AND,
    OR
}

export type ContainsFilter = {
    filter: string,
    minLength: number,
    matchingFieldIds: string[]
}

export type ExactMatchFilter = {
    matchingFieldId: string,
    matchValues: any[],
    isStrictMatch: boolean
}

export type ConditionalMatchFilter = {
    matchingFieldId: string,
    matchValue: any,
    condition: ComparisonType,
    isStrictMatch: boolean,
    evaluator?: evaluatorFunction
}

export type CollectionFilter = {
    contains: ContainsFilter[]
    exactMatch: ExactMatchFilter[],
    exactMatchLogicType?: MatchLogicType,
    conditionMatch: ConditionalMatchFilter[],
    conditionalMatchLogicType?: MatchLogicType
}
