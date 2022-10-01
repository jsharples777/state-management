import debug from 'debug';
import {ComparisonType} from "../CommonTypes";
import {CollectionFilter, ContainsFilter, MatchLogicType} from "./Types";

const logger = debug('collection-view-processor');


export class CollectionFilterProcessor {
    public static doesItemMatchFilterConfig(collectionName: string, item: any, config: CollectionFilter): boolean {
        return CollectionFilterProcessor.hasExactMatchOrNoExactMatchNeeded(collectionName, item, config) &&
            CollectionFilterProcessor.hasPartialMatchOrNoPartialMatchNeeded(collectionName, item, config) &&
            CollectionFilterProcessor.hasConditionalMatchOrNoMatchNeeded(collectionName, item, config);
    }

    public static getFilteredState(collectionName: string, currentState: any[], filter: CollectionFilter | null, onlyDisplayWithFilter: boolean = false): any[] {
        let filteredState: any[] = [];
        // do we have a filter?
        if (filter) {
            if (currentState) {
                currentState.forEach((item: any) => {

                    if (CollectionFilterProcessor.doesItemMatchFilterConfig(collectionName, item, filter)) {
                        filteredState.push(item);
                    }
                });
            }
        } else {
            // do we only show content with a filter?
            if (onlyDisplayWithFilter) {
                filteredState = [];
            } else {
                filteredState = currentState;
            }
        }
        return filteredState;

    }

    protected static hasConditionalMatch(collectionName: string, item: any, config: CollectionFilter, index: number): boolean {
        let result = false;
        if (item) {
            const conditionMatch = config.conditionMatch[index];
            const fieldValue = item[conditionMatch.matchingFieldId];
            if (fieldValue !== undefined) {
                switch (conditionMatch.condition) {
                    case ComparisonType.equals: {
                        if (fieldValue == conditionMatch.matchValue) {
                            result = true;
                        }
                        break;
                    }
                    case ComparisonType.lessThan: {
                        if (fieldValue < conditionMatch.matchValue) {
                            result = true;
                        }
                        break;
                    }
                    case ComparisonType.lessThanEqual: {
                        if (fieldValue <= conditionMatch.matchValue) {
                            result = true;
                        }
                        break;
                    }
                    case ComparisonType.greaterThan: {
                        if (fieldValue > conditionMatch.matchValue) {
                            result = true;
                        }
                        break;
                    }
                    case ComparisonType.greaterThanEqual: {
                        if (fieldValue >= conditionMatch.matchValue) {
                            result = true;
                        }
                        break;
                    }
                    case ComparisonType.isNotNull: {
                        result = true;
                        break;
                    }
                }
                logger(`Conditional match for ${collectionName} item, field ${conditionMatch.matchingFieldId} with value ${fieldValue} against values ${conditionMatch.matchValue} - is match? ${result}`);
            } else {
                if (conditionMatch.condition === ComparisonType.isNull) {
                    logger(`Conditional match for ${collectionName} item, field ${conditionMatch.matchingFieldId} has NO field value for null condition - TRUE`);
                    result = true;
                } else {
                    logger(`Conditional match for ${collectionName} item, field ${conditionMatch.matchingFieldId} has NO field value against values ${conditionMatch.matchValue}`);
                }
            }
        }
        return result;
    }

    protected static hasConditionalMatchOrNoMatchNeeded(collectionName: string, item: any, config: CollectionFilter): boolean {
        let result = true;
        if (config.conditionMatch.length > 0) {
            if (item) {
                let conditionalMatchResults: boolean[] = []
                config.conditionMatch.forEach((exactMatch, index) => {
                    conditionalMatchResults.push(CollectionFilterProcessor.hasConditionalMatch(collectionName, item, config, index));
                });
                // what logic are we applying to conditional matches>?
                if (conditionalMatchResults.length > 1) {
                    if (!config.conditionalMatchLogicType) {
                        config.conditionalMatchLogicType = MatchLogicType.AND;
                    }
                    if (config.conditionalMatchLogicType === MatchLogicType.AND) {
                        result = true;
                        conditionalMatchResults.forEach((itemResult) => {
                            result = result && itemResult;
                        });
                    }
                    if (config.conditionalMatchLogicType === MatchLogicType.OR) {
                        result = false;
                        conditionalMatchResults.forEach((itemResult, index) => {
                            const exactMatch = config.exactMatch[index];
                            if (exactMatch.isStrictMatch) {
                                result = result && itemResult;
                            } else {
                                result = result || itemResult;
                            }
                        });
                    }
                } else {
                    result = conditionalMatchResults[0];
                }
            }
        } else {
            logger(`No conditional match needed, sending true`);
            result = true;
        }
        return result
    }

    protected static hasExactMatch(collectionName: string, item: any, config: CollectionFilter, index: number): boolean {
        let result = false;
        if (item) {
            const exactMatch = config.exactMatch[index];
            const fieldValue = item[exactMatch.matchingFieldId];
            if (fieldValue !== undefined) {
                exactMatch.matchValues.forEach((matchValue: any) => {
                    if (fieldValue == matchValue) result = true;
                });
                logger(`Exact match for ${collectionName} item, field ${exactMatch.matchingFieldId} with value ${fieldValue} against values ${exactMatch.matchValues} - is match? ${result}`);
            } else {
                logger(`Exact match for ${collectionName} item, field ${exactMatch.matchingFieldId} has NO field value against values ${exactMatch.matchValues}`);
            }
        }
        return result;
    }

    protected static hasExactMatchOrNoExactMatchNeeded(collectionName: string, item: any, config: CollectionFilter): boolean {
        let result = true;
        if (config.exactMatch.length > 0) {
            if (item) {
                let exactMatchResults: boolean[] = []
                config.exactMatch.forEach((exactMatch, index) => {
                    exactMatchResults.push(CollectionFilterProcessor.hasExactMatch(collectionName, item, config, index));
                });
                // what logic are we applying to exact matches>?
                if (exactMatchResults.length > 1) {
                    if (!config.exactMatchLogicType) {
                        config.exactMatchLogicType = MatchLogicType.AND;
                    }
                    if (config.exactMatchLogicType === MatchLogicType.AND) {
                        result = true;
                        exactMatchResults.forEach((itemResult) => {
                            result = result && itemResult;
                        });
                    }
                    if (config.exactMatchLogicType === MatchLogicType.OR) {
                        result = false;
                        exactMatchResults.forEach((itemResult, index) => {
                            const exactMatch = config.exactMatch[index];
                            if (exactMatch.isStrictMatch) {
                                result = result && itemResult;
                            } else {
                                result = result || itemResult;
                            }
                        });
                    }
                } else {
                    result = exactMatchResults[0];
                }
            }
        } else {
            logger(`No exact match needed, sending true`);
            result = true;
        }
        return result
    }

    protected static hasPartialMatch(collectionName: string, item: any, partialMatch: ContainsFilter): boolean {
        let result = false;
        if (item) {
            const filterValue = partialMatch.filter.trim().toLowerCase();
            let done = false;
            let counter = 0;
            while (!done) {
                if (counter < partialMatch.matchingFieldIds.length) {
                    const fieldId = partialMatch.matchingFieldIds[counter];
                    const fieldValue = item[fieldId];
                    if (fieldValue !== undefined) {
                        let fieldValueString = fieldValue + '';
                        fieldValueString = fieldValueString.toLowerCase();
                        if (fieldValueString.includes(filterValue)) {
                            logger(`Partial match for ${collectionName} item found in field ${fieldId} with filter ${filterValue}`);
                            result = true;
                            done = true;
                        }
                    }
                    counter++;
                } else {
                    logger(`Partial match for ${collectionName} item not found in matching fields`);
                    done = true;
                }
            }
        }
        return result;

    }

    protected static hasPartialMatchOrNoPartialMatchNeeded(collectionName: string, item: any, config: CollectionFilter): boolean {
        let result = false;
        if (config.contains.length > 0) {
            if (item) {
                config.contains.forEach((partialMatch) => {
                    if (CollectionFilterProcessor.hasPartialMatch(collectionName, item, partialMatch)) {
                        result = true;
                    }
                });
            }
        } else {
            logger(`No partial match needed, sending true`);
            result = true;
        }
        return result;
    }


}
