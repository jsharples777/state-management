import debug from 'debug';
import { ComparisonType } from "../CommonTypes";
import { MatchLogicType } from "./Types";
const logger = debug('collection-view-processor');
export class CollectionFilterProcessor {
    static doesItemMatchFilterConfig(collectionName, item, config) {
        return CollectionFilterProcessor.hasExactMatchOrNoExactMatchNeeded(collectionName, item, config) &&
            CollectionFilterProcessor.hasPartialMatchOrNoPartialMatchNeeded(collectionName, item, config) &&
            CollectionFilterProcessor.hasConditionalMatchOrNoMatchNeeded(collectionName, item, config);
    }
    static getFilteredState(collectionName, currentState, filter, onlyDisplayWithFilter = false) {
        let filteredState = [];
        // do we have a filter?
        if (filter) {
            if (currentState) {
                currentState.forEach((item) => {
                    if (CollectionFilterProcessor.doesItemMatchFilterConfig(collectionName, item, filter)) {
                        filteredState.push(item);
                    }
                });
            }
        }
        else {
            // do we only show content with a filter?
            if (onlyDisplayWithFilter) {
                filteredState = [];
            }
            else {
                filteredState = currentState;
            }
        }
        return filteredState;
    }
    static hasConditionalMatch(collectionName, item, config, index) {
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
            }
            else {
                if (conditionMatch.condition === ComparisonType.isNull) {
                    logger(`Conditional match for ${collectionName} item, field ${conditionMatch.matchingFieldId} has NO field value for null condition - TRUE`);
                    result = true;
                }
                else {
                    logger(`Conditional match for ${collectionName} item, field ${conditionMatch.matchingFieldId} has NO field value against values ${conditionMatch.matchValue}`);
                }
            }
        }
        return result;
    }
    static hasConditionalMatchOrNoMatchNeeded(collectionName, item, config) {
        let result = true;
        if (config.conditionMatch.length > 0) {
            if (item) {
                let conditionalMatchResults = [];
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
                            }
                            else {
                                result = result || itemResult;
                            }
                        });
                    }
                }
                else {
                    result = conditionalMatchResults[0];
                }
            }
        }
        else {
            logger(`No conditional match needed, sending true`);
            result = true;
        }
        return result;
    }
    static hasExactMatch(collectionName, item, config, index) {
        let result = false;
        if (item) {
            const exactMatch = config.exactMatch[index];
            const fieldValue = item[exactMatch.matchingFieldId];
            if (fieldValue !== undefined) {
                exactMatch.matchValues.forEach((matchValue) => {
                    if (fieldValue == matchValue)
                        result = true;
                });
                logger(`Exact match for ${collectionName} item, field ${exactMatch.matchingFieldId} with value ${fieldValue} against values ${exactMatch.matchValues} - is match? ${result}`);
            }
            else {
                logger(`Exact match for ${collectionName} item, field ${exactMatch.matchingFieldId} has NO field value against values ${exactMatch.matchValues}`);
            }
        }
        return result;
    }
    static hasExactMatchOrNoExactMatchNeeded(collectionName, item, config) {
        let result = true;
        if (config.exactMatch.length > 0) {
            if (item) {
                let exactMatchResults = [];
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
                            }
                            else {
                                result = result || itemResult;
                            }
                        });
                    }
                }
                else {
                    result = exactMatchResults[0];
                }
            }
        }
        else {
            logger(`No exact match needed, sending true`);
            result = true;
        }
        return result;
    }
    static hasPartialMatch(collectionName, item, partialMatch) {
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
                }
                else {
                    logger(`Partial match for ${collectionName} item not found in matching fields`);
                    done = true;
                }
            }
        }
        return result;
    }
    static hasPartialMatchOrNoPartialMatchNeeded(collectionName, item, config) {
        let result = false;
        if (config.contains.length > 0) {
            if (item) {
                config.contains.forEach((partialMatch) => {
                    if (CollectionFilterProcessor.hasPartialMatch(collectionName, item, partialMatch)) {
                        result = true;
                    }
                });
            }
        }
        else {
            logger(`No partial match needed, sending true`);
            result = true;
        }
        return result;
    }
}
//# sourceMappingURL=CollectionFilterProcessor.js.map