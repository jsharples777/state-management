import { CollectionFilter, ContainsFilter } from "./Types";
export declare class CollectionFilterProcessor {
    static doesItemMatchFilterConfig(collectionName: string, item: any, config: CollectionFilter): boolean;
    static getFilteredState(collectionName: string, currentState: any[], filter: CollectionFilter | null, onlyDisplayWithFilter?: boolean): any[];
    protected static hasConditionalMatch(collectionName: string, item: any, config: CollectionFilter, index: number): boolean;
    protected static hasConditionalMatchOrNoMatchNeeded(collectionName: string, item: any, config: CollectionFilter): boolean;
    protected static hasExactMatch(collectionName: string, item: any, config: CollectionFilter, index: number): boolean;
    protected static hasExactMatchOrNoExactMatchNeeded(collectionName: string, item: any, config: CollectionFilter): boolean;
    protected static hasPartialMatch(collectionName: string, item: any, partialMatch: ContainsFilter): boolean;
    protected static hasPartialMatchOrNoPartialMatchNeeded(collectionName: string, item: any, config: CollectionFilter): boolean;
}
