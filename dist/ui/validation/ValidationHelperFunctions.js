import { FieldType } from "../../model/DataObjectTypeDefs";
import { ComparisonType } from "../../CommonTypes";
import debug from 'debug';
const logger = debug('validation-helper-functions');
export class ValidationHelperFunctions {
    constructor() {
    }
    static getInstance() {
        if (!(ValidationHelperFunctions._instance)) {
            ValidationHelperFunctions._instance = new ValidationHelperFunctions();
        }
        return ValidationHelperFunctions._instance;
    }
    areTwoFieldsEqual(targetField, sourceField) {
        let result = { ruleFailed: false };
        if (targetField.getValue() !== sourceField.getValue()) {
            result = {
                ruleFailed: true,
                message: `${targetField.getName()} must be equal to ${sourceField.getName()}`,
            };
        }
        return result;
    }
    isFieldAndValueEqual(field, value) {
        let result = { ruleFailed: false };
        if (field.getValue() !== value) {
            result = {
                ruleFailed: true,
                message: `${field.getName()} must be equal to ${value}`,
            };
        }
        return result;
    }
    compareTwoValuesWithTypes(targetType, targetValue, sourceType, sourceValue, comparison) {
        if (!(targetValue) || !(sourceValue))
            return false; // no null comparisons
        logger(`Comparing two values with types and comparison ${comparison} - target value (type:${targetType},value:${targetValue}), source value (type:${sourceType},value:${sourceValue})`);
        switch (targetType) {
            case (FieldType.date): {
                targetValue += ' 00:00:00';
                if (sourceType === FieldType.date) {
                    sourceValue += ' 00:00:00';
                }
                break;
            }
            case (FieldType.datetime): {
                if (sourceType === FieldType.date) {
                    sourceValue += ' 00:00:00';
                }
                break;
            }
            case (FieldType.time): {
                if (sourceType === FieldType.shortTime) {
                    sourceValue += ':00';
                }
                break;
            }
            case (FieldType.shortTime): {
                targetValue += ':00';
                if (sourceType === FieldType.shortTime) {
                    sourceValue += ':00';
                }
                break;
            }
        }
        logger(`Comparing ${targetValue} of type ${targetType} against ${sourceValue} of type ${sourceType}`);
        switch (comparison) {
            case ComparisonType.lessThan: {
                return (targetValue < sourceValue);
            }
            case ComparisonType.lessThanEqual: {
                return (targetValue <= sourceValue);
            }
            case ComparisonType.greaterThanEqual: {
                return (targetValue >= sourceValue);
            }
            case ComparisonType.greaterThan: {
                return (targetValue > sourceValue);
            }
            case ComparisonType.equals: {
                return (targetValue === sourceValue);
            }
        }
        return false;
    }
    isTargetLessThanSource(targetField, sourceField) {
        let result = { ruleFailed: false };
        let sourceType = sourceField.getFieldDefinition().type;
        let targetType = targetField.getFieldDefinition().type;
        let sourceValue = sourceField.getValue();
        let targetValue = targetField.getValue();
        if (!this.compareTwoValuesWithTypes(targetType, targetValue, sourceType, sourceValue, ComparisonType.lessThan)) {
            result = {
                ruleFailed: true,
                message: `${targetField.getName()} must be less than ${sourceField.getName()}`,
            };
        }
        return result;
    }
    isFieldLessThanValue(field, value) {
        let result = { ruleFailed: false };
        let type = field.getFieldDefinition().type;
        let sourceValue = field.getValue();
        if (!this.compareTwoValuesWithTypes(type, sourceValue, type, value, ComparisonType.lessThan)) {
            result = {
                ruleFailed: true,
                message: `${field.getName()} must be less than ${value}`,
            };
        }
        return result;
    }
    isFieldLessThanEqualValue(field, value) {
        let result = { ruleFailed: false };
        let check = this.isFieldAndValueEqual(field, value);
        if (check.ruleFailed) {
            check = this.isFieldLessThanValue(field, value);
            if (check.ruleFailed) {
                result = {
                    ruleFailed: true,
                    message: `${field.getName()} must be less than or equal to ${value}`,
                };
            }
        }
        return result;
    }
    isFieldGreaterThanValue(field, value) {
        let result = { ruleFailed: false };
        let type = field.getFieldDefinition().type;
        let sourceValue = field.getValue();
        if (!this.compareTwoValuesWithTypes(type, sourceValue, type, value, ComparisonType.greaterThan)) {
            result = {
                ruleFailed: true,
                message: `${field.getName()} must be greater than ${value}`,
            };
        }
        return result;
    }
    isFieldGreaterThanEqualValue(field, value) {
        let result = { ruleFailed: false };
        let check = this.isFieldAndValueEqual(field, value);
        if (check.ruleFailed) {
            check = this.isFieldGreaterThanValue(field, value);
            if (check.ruleFailed) {
                result = {
                    ruleFailed: true,
                    message: `${field.getName()} must be greater than or equal to ${value}`,
                };
            }
        }
        return result;
    }
    isTargetLessThanEqualSource(targetField, sourceField) {
        let result = { ruleFailed: false };
        let check = this.areTwoFieldsEqual(targetField, sourceField);
        if (check.ruleFailed) {
            check = this.isTargetLessThanSource(targetField, sourceField);
            if (check.ruleFailed) {
                result = {
                    ruleFailed: true,
                    message: `${targetField.getName()} must be less than or equal to ${sourceField.getName()}`,
                };
            }
        }
        return result;
    }
    isTargetGreaterThan(targetField, sourceField) {
        let result = { ruleFailed: false };
        let sourceType = sourceField.getFieldDefinition().type;
        let targetType = targetField.getFieldDefinition().type;
        let sourceValue = sourceField.getValue();
        let targetValue = targetField.getValue();
        if (!this.compareTwoValuesWithTypes(targetType, targetValue, sourceType, sourceValue, ComparisonType.greaterThan)) {
            result = {
                ruleFailed: true,
                message: `${targetField.getName()} must be greater than ${sourceField.getName()}`,
            };
        }
        return result;
    }
    isFieldNull(sourceField) {
        let result = { ruleFailed: false };
        let targetValue = sourceField.getValue();
        // @ts-ignore
        logger(`field ${field.getId()} is null - current value is '${targetValue}'`);
        if ((targetValue) && (targetValue.trim().length > 0)) {
            result = {
                ruleFailed: true,
                message: `${sourceField.getName()} must be empty`,
            };
        }
        return result;
    }
    isFieldNotNull(field) {
        let result = { ruleFailed: false };
        let targetValue = field.getValue();
        logger(`field ${field.getId()} is NOT null - current value is '${targetValue}'`);
        // @ts-ignore
        if (targetValue) {
            if (targetValue.trim().length === 0) {
                result = {
                    ruleFailed: true,
                    message: `${field.getName()} must not be empty`,
                };
            }
        }
        else {
            result = {
                ruleFailed: true,
                message: `${field.getName()} must not be empty`,
            };
        }
        return result;
    }
    doesFieldHaveValue(field, values) {
        let result = { ruleFailed: false };
        let targetValue = field.getValue();
        logger(`does field ${field.getId()} have value from ${values} - current value is ${targetValue}`);
        if (targetValue) {
            // split the values by commas
            let foundInValue = false;
            values.forEach((split) => {
                if (targetValue === split) {
                    logger(`does field ${field.getId()} have value from ${values} - current value is ${targetValue} - found in value(s)`);
                    foundInValue = true;
                }
            });
            if (!foundInValue) {
                result = {
                    ruleFailed: true,
                    message: `${field.getName()} must be have a value in ${values}`,
                };
            }
        }
        return result;
    }
    doesSourceFieldHaveValue(field, values) {
        return this.doesFieldHaveValue(field, values);
    }
    isFieldNotValue(field, values) {
        let result = { ruleFailed: false };
        let targetValue = field.getValue();
        logger(`does field ${field.getId()} not match value from ${values} - current value is ${targetValue}`);
        if (targetValue) {
            // split the values by commas
            let foundInValue = false;
            values.forEach((split) => {
                if (targetValue === split) {
                    logger(`does field ${field.getId()} not match value from ${values} - current value is ${targetValue} - found in value(s)`);
                    foundInValue = true;
                }
            });
            if (foundInValue) {
                result = {
                    ruleFailed: true,
                    message: `${field.getName()} must not be a value in ${values}`,
                };
            }
        }
        return result;
    }
    sourceFieldIsNotValue(field, values) {
        return this.isFieldNotValue(field, values);
    }
    isTargetGreaterThanEqualSource(targetField, sourceField) {
        let result = { ruleFailed: false };
        let check = this.areTwoFieldsEqual(targetField, sourceField);
        if (check.ruleFailed) {
            check = this.isTargetGreaterThan(targetField, sourceField);
            if (check.ruleFailed) {
                result = {
                    ruleFailed: true,
                    message: `${targetField.getName()} must be greater than or equal to ${sourceField.getName()}`,
                };
            }
        }
        return result;
    }
    compareFields(targetField, sourceField, comparison, value) {
        switch (comparison) {
            case ComparisonType.equals: {
                return this.areTwoFieldsEqual(targetField, sourceField);
                break;
            }
            case ComparisonType.lessThan: {
                return this.isTargetLessThanSource(targetField, sourceField);
                break;
            }
            case ComparisonType.lessThanEqual: {
                return this.isTargetLessThanEqualSource(targetField, sourceField);
                break;
            }
            case ComparisonType.greaterThan: {
                return this.isTargetGreaterThan(targetField, sourceField);
                break;
            }
            case ComparisonType.greaterThanEqual: {
                return this.isTargetGreaterThanEqualSource(targetField, sourceField);
                break;
            }
            case ComparisonType.isNull: {
                return this.isFieldNull(sourceField);
                break;
            }
            case ComparisonType.isNotNull: {
                return this.isFieldNotNull(sourceField);
                break;
            }
            case ComparisonType.hasValue: {
                return this.doesSourceFieldHaveValue(sourceField, value);
                break;
            }
            case ComparisonType.isNotValue: {
                return this.sourceFieldIsNotValue(sourceField, value);
                break;
            }
        }
    }
    compareFieldWithValue(field, comparison, value) {
        switch (comparison) {
            case ComparisonType.equals: {
                return this.isFieldAndValueEqual(field, value[0]);
                break;
            }
            case ComparisonType.lessThan: {
                return this.isFieldLessThanValue(field, value[0]);
                break;
            }
            case ComparisonType.lessThanEqual: {
                return this.isFieldLessThanEqualValue(field, value[0]);
                break;
            }
            case ComparisonType.greaterThan: {
                return this.isFieldGreaterThanValue(field, value[0]);
                break;
            }
            case ComparisonType.greaterThanEqual: {
                return this.isFieldGreaterThanEqualValue(field, value[0]);
                break;
            }
            case ComparisonType.isNull: {
                return this.isFieldNull(field);
                break;
            }
            case ComparisonType.isNotNull: {
                return this.isFieldNotNull(field);
                break;
            }
            case ComparisonType.hasValue: {
                return this.doesSourceFieldHaveValue(field, value);
                break;
            }
            case ComparisonType.isNotValue: {
                return this.sourceFieldIsNotValue(field, value);
                break;
            }
        }
    }
}
//# sourceMappingURL=ValidationHelperFunctions.js.map