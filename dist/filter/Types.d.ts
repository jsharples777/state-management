import { ComparisonType, evaluatorFunction } from "../CommonTypes";
export declare enum MatchLogicType {
    AND = 0,
    OR = 1
}
export declare type ContainsFilter = {
    filter: string;
    minLength: number;
    matchingFieldIds: string[];
};
export declare type ExactMatchFilter = {
    matchingFieldId: string;
    matchValues: any[];
    isStrictMatch: boolean;
};
export declare type ConditionalMatchFilter = {
    matchingFieldId: string;
    matchValue: any;
    condition: ComparisonType;
    isStrictMatch: boolean;
    evaluator?: evaluatorFunction;
};
export declare type CollectionFilter = {
    contains: ContainsFilter[];
    exactMatch: ExactMatchFilter[];
    exactMatchLogicType?: MatchLogicType;
    conditionMatch: ConditionalMatchFilter[];
    conditionalMatchLogicType?: MatchLogicType;
};
