import {
    ConditionResponse,
    MultipleConditionLogic, RuleCheck,
    RuleResponse,
    ValidationCondition,
    ValidationRule
} from "./ValidationTypeDefs";
import {Field} from "../field/Field";
import debug from 'debug';
import {FieldDefinition, FieldType} from "../../model/DataObjectTypeDefs";
import {FieldListener} from "../field/FieldListener";
import {ComparisonType, ViewMode} from "../../CommonTypes";
import {ValidationHelperFunctions} from "./ValidationHelperFunctions";
import {ViewFieldValidator} from "./ViewFieldValidator";
import {ValidatableView} from "./ValidatableView";

const logger = debug('validation-manager');
const flogger = debug('validation-manager-rule-failure');
const erLogger = debug('validation-manager-execute-rule');
const merLogger = debug('validation-manager-multiple-condition-rule-results');




type _Condition = {
    sourceField?: Field,
    comparison: ComparisonType,
    values?: string[],
};

type _ValidationRule = {
    viewMode: ViewMode,
    targetField: Field,
    response: ConditionResponse,
    conditions: _Condition[];
    multipleConditionLogic: MultipleConditionLogic
}

type ViewRuleSet = {
    validatableView: ValidatableView,
    rules: _ValidationRule[]
}

export class ValidationManager implements FieldListener, ViewFieldValidator {

    private static _instance: ValidationManager;
    private viewRules: ViewRuleSet[];
    private viewValidators: ViewFieldValidator[];

    private constructor() {
        this.viewRules = [];
        this.viewValidators = [];
    }

    public static getInstance(): ValidationManager {
        if (!(ValidationManager._instance)) {
            ValidationManager._instance = new ValidationManager();
        }
        return ValidationManager._instance;
    }

    public addViewValidator(validator: ViewFieldValidator) {
        this.viewValidators.push(validator);
    }

    public getName(): string {
        return "Validation Manager";
    }

    public addRuleToView(validatableView: ValidatableView, rule: ValidationRule) { // returns whether the rule was added
        logger(`Adding rule on form ${validatableView.getId()} for target field ${rule.targetDataFieldId}`);
        /*
         validate the rule
         1. does the rule have a comparison field or static for each condition?
         2. do the fields exist?
         3. are the comparisons valid types to compare?
        */
        let targetField: Field | undefined = validatableView.getFieldFromDataFieldId(rule.targetDataFieldId);
        if (!targetField) {
            flogger(`Rule not added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - NOT FOUND in form`);
        } else {

            let convertedRule: _ValidationRule = {
                viewMode: rule.viewMode,
                targetField: targetField,
                response: rule.response,
                conditions: [],
                multipleConditionLogic: MultipleConditionLogic.failIfAnyConditionFails
            }

            if (rule.multipleConditionLogic) {
                convertedRule.multipleConditionLogic = rule.multipleConditionLogic;
            }


            if (rule.conditions) {
                rule.conditions.forEach((condition) => {
                    if (targetField) {
                        const convertedCondition = this.createRuleCondition(validatableView, targetField, rule, condition);
                        if (convertedCondition) {
                            convertedRule.conditions.push(convertedCondition);
                        }
                    }
                });
            }
            logger(`Converted rule to `);
            logger(convertedRule);

            logger(`Converted rule has ${convertedRule.conditions.length} conditions`);
            let index = this.viewRules.findIndex((viewRule) => viewRule.validatableView.getId() === validatableView.getId());
            let formRuleSet: ViewRuleSet;
            // store the rules for later execution
            if (index < 0) {
                formRuleSet = {
                    validatableView: validatableView,
                    rules: []
                }
                formRuleSet.rules.push(convertedRule);
                this.viewRules.push(formRuleSet)
            } else {
                formRuleSet = this.viewRules[index];
                formRuleSet.rules.push(convertedRule);
            }
            logger(`Current set of rules for form ${validatableView.getId()}`);
            logger(formRuleSet);

        }
    }

    public failedValidation(view: ValidatableView, field: FieldDefinition, currentValue: string, message: string): void {
    } // ignored, we might be causing

    public applyRulesToTargetField(validatableView: ValidatableView, viewMode: ViewMode, field: FieldDefinition, onlyRulesOfType: ConditionResponse | null): RuleCheck {
        logger(`Checking rules for form ${validatableView.getId()}, data field ${field.id} of type ${onlyRulesOfType}`);
        // which rules apply?
        let rules: _ValidationRule[] = this.getRulesForFieldChange(validatableView, field.id, false);

        let result: RuleCheck = {
            ruleFailed: false
        }

        // get the rules for the field, filtered by the condition response type
        if (onlyRulesOfType) {
            logger(`Only validating rules of type ${onlyRulesOfType}`);
            let ruleSubset: _ValidationRule[] = [];
            rules.forEach((rule) => {
                if (rule.response === onlyRulesOfType) {
                    ruleSubset.push(rule);
                }
            });
            rules = ruleSubset;
        }


        rules.forEach((rule) => {
            let response: RuleResponse = this.executeRule(viewMode, rule);
            if (response.ruleFailed) {
                flogger(`Rule failed for form ${validatableView.getId()} with field ${field.displayName} with message ${response.message}`);
                result.ruleFailed = true;
                result.message = response.message;
            }
        });

        // if we haven't failed yet and we have validators
        this.viewValidators.forEach((validator) => {
            let ruleCheck: RuleCheck = validator.applyRulesToTargetField(validatableView, viewMode, field, onlyRulesOfType);
            if (ruleCheck.ruleFailed) {
                flogger(`FormFieldValidator - Rule failed for form ${validatableView.getId()} with field ${field.displayName} with message ${ruleCheck.message}`);
                result.ruleFailed = true;
                result.message = ruleCheck.message;
            }
        });
        return result;
    }

    public valueChanged(view: ValidatableView, field: Field, fieldDef: FieldDefinition, newValue: string | null): void {
        logger(`Handling field change - form ${view}, data field ${fieldDef.id}, value ${newValue}`
        )
        ;
        // a field we are listening to has changed
        // which rules apply?
        const rules: _ValidationRule[] = this.getRulesForFieldChange(view, fieldDef.id, true);
        // execute each rule and collect the responses
        let failedResponses: RuleResponse[] = [];

        rules.forEach((rule) => {
            let response: RuleResponse = this.executeRule(view.getViewMode(), rule);
            if (response.ruleFailed) {
                failedResponses.push(response);
            }
        });

        logger(`Have ${failedResponses.length} failed rules - applying each`);
        // for each failed response let the target field know based on the response type
        failedResponses.forEach((response) => {
            switch (response.response) {
                case ConditionResponse.hide: {
                    logger(`Apply hide ${response.field.getId()}`);
                    response.field.hide();
                    break;
                }
                case ConditionResponse.show: {
                    logger(`Apply show ${response.field.getId()}`);
                    response.field.show();
                    break;
                }
                case ConditionResponse.invalid: {
                    logger(`Apply invalid ${response.field.getId()}`);
                    if (response.message) response.field.setInvalid(response.message);
                    break;
                }
                case ConditionResponse.valid: {
                    logger(`Apply valid ${response.field.getId()}`);
                    response.field.setValid();
                    break;
                }
            }
        })
    }

    protected createRuleCondition(validatableView: ValidatableView, targetField: Field, rule: ValidationRule, condition: ValidationCondition): _Condition | null {
        let result: _Condition | null = null;

        if (!(condition.values) && !(condition.sourceDataFieldId)) { // direct field comparison
            logger(`Rule added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - condition is a simple comparison of target field (isNull, isNotNull)`);
            if ((condition.comparison === ComparisonType.isNotNull) || (condition.comparison === ComparisonType.isNull)) {
                result = {
                    comparison: condition.comparison
                };
            } else {
                flogger(`Rule not added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - condition is a simple comparison of target field (isNull, isNotNull) - comparison type is invalid`);
            }
        } else if ((condition.values) && (condition.sourceDataFieldId)) { // is this a target field value comparison?
            logger(`Rule adding for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - source field ${condition.sourceDataFieldId} with values ${condition.values}`);
            let sourceField: Field | undefined = validatableView.getFieldFromDataFieldId(condition.sourceDataFieldId);
            if (!sourceField) {
                flogger(`Rule not added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - source field ${condition.sourceDataFieldId} NOT FOUND`);

            } else {
                result = {
                    sourceField: sourceField,
                    comparison: condition.comparison,
                    values: condition.values
                };
                sourceField.addFieldListener(this);
            }
        } else if ((condition.values) && !(condition.sourceDataFieldId)) { // is this a value comparison?
            logger(`Rule adding for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - values ${condition.values}`);
            // add a new value rule to the internal structure

            result = {values: condition.values, comparison: condition.comparison};
            if (targetField) targetField.addFieldListener(this);

        } else if ((condition.sourceDataFieldId) && (!condition.values)) { // is this a field vs field comparison
            logger(`Rule adding for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - source field ${condition.sourceDataFieldId}`);
            let sourceField: Field | undefined = validatableView.getFieldFromDataFieldId(condition.sourceDataFieldId);
            if (!sourceField) {
                flogger(`Rule not added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - source field ${condition.sourceDataFieldId} NOT FOUND`);
            } else {
                if (this.canCompareSourceAndTarget(validatableView, rule, sourceField, targetField)) {
                    result = {
                        sourceField: sourceField,
                        comparison: condition.comparison
                    };
                    sourceField.addFieldListener(this);
                }

            }
        }
        return result;
    }

    protected canCompareSourceAndTarget(validatableView: ValidatableView, rule: ValidationRule, sourceField: Field, targetField?: Field): boolean {
        let result = true;
        /*
           are we comparing two fields that can be compared?
           allowed combinations are:
           date|datetime vs date|datetime
           time|short time vs time|short time
           boolean vs boolean
           integer|float vs number|float
           any other vs any other
         */
        let sourceType = sourceField.getFieldDefinition().type;
        let targetType = targetField?.getFieldDefinition().type;

        switch (targetType) {
            case (FieldType.date):
            case (FieldType.datetime): {
                if ((sourceType !== FieldType.datetime) &&
                    (sourceType !== FieldType.date)) {
                    flogger(`Rule not added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - target is date(time), source is NOT`);
                    result = false;
                }
                break;
            }
            case (FieldType.time):
            case (FieldType.shortTime): {
                if ((sourceType !== FieldType.time) &&
                    (sourceType !== FieldType.shortTime)) {
                    flogger(`Rule not added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - target is time, source is NOT`);
                    result = false;
                }
                break;
            }
            case (FieldType.boolean): {
                if ((sourceType !== FieldType.boolean)) {
                    flogger(`Rule not added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - target is boolean, source is NOT`);
                    result = false;
                }
                break;
            }
            case (FieldType.integer):
            case (FieldType.float): {
                if ((sourceType !== FieldType.integer) &&
                    (sourceType !== FieldType.float)) {
                    flogger(`Rule not added for form ${validatableView.getId()} for target field ${rule.targetDataFieldId} - target is number, source is NOT`);
                    result = false;
                }
                break;
            }
        }
        return result;

    }

    private executeRule(formMode: ViewMode, rule: _ValidationRule): RuleResponse {
        let response: RuleResponse = {
            field: rule.targetField,
            ruleFailed: false,
            response: rule.response,
        }
        // run each field comparison
        erLogger(`Executing rule with response ${rule.response} for target ${rule.targetField.getId()}`);
        erLogger(rule);


        let ruleChecks: RuleCheck[] = [];

        if (rule.conditions.length > 0) {

            rule.conditions.forEach((condition) => {
                erLogger('condition rule');
                erLogger(condition);
                let values = [''];
                if (condition.values) {
                    values = condition.values;
                }
                let ruleCheck: RuleCheck;

                if (condition.sourceField) {
                    erLogger('condition rule - source field present');
                    ruleCheck = ValidationHelperFunctions.getInstance().compareFields(rule.targetField, condition.sourceField, condition.comparison, values);
                } else {
                    erLogger(`condition rule - target field value check - ${values}`);
                    ruleCheck = ValidationHelperFunctions.getInstance().compareFieldWithValue(rule.targetField, condition.comparison, values);
                }
                ruleChecks.push(ruleCheck);
                if (ruleCheck.ruleFailed) {
                    flogger('condition rule FAILED');
                } else {
                    flogger('condition rule PASSED');
                }
            });


            // are we dealing with one rule check or multiple?
            if (ruleChecks.length === 1) {
                flogger(`Single rule check - rule failed? ${ruleChecks[0].ruleFailed}`)
                response.message = ruleChecks[0].message;
                response.ruleFailed = ruleChecks[0].ruleFailed;
            } else {
                let errorMessageBuffer = '';
                let failedRuleChecks: RuleCheck[] = [];
                ruleChecks.forEach((ruleCheck, index) => {
                    if (ruleCheck.ruleFailed) {
                        ruleCheck.index = index;
                        failedRuleChecks.push(ruleCheck);
                        errorMessageBuffer += ruleCheck.message + ', ';
                    }
                });
                if (errorMessageBuffer.length > 0) {
                    errorMessageBuffer = errorMessageBuffer.substr(0, errorMessageBuffer.length - 2);
                }
                merLogger(`Multiple rule check - number of failures ${failedRuleChecks.length} with message ${errorMessageBuffer}`);

                switch (rule.multipleConditionLogic) {
                    case MultipleConditionLogic.failIfAnyConditionFails: {
                        if (failedRuleChecks.length > 0) {
                            flogger(`Multiple rule check - when any conditions fail - rule FAILED`);
                            merLogger(`Multiple rule check - when any conditions fail - rule FAILED`);
                            response.message = errorMessageBuffer;
                            response.ruleFailed = true;
                        }
                        break;
                    }
                    case MultipleConditionLogic.onlyFailIfAllConditionsFail: {
                        if (failedRuleChecks.length === ruleChecks.length) {
                            flogger(`Multiple rule check - when all conditions fail - rule FAILED`);
                            merLogger(`Multiple rule check - when all conditions fail - rule FAILED`);
                            response.ruleFailed = true;
                            response.message = errorMessageBuffer;
                        }
                        break;
                    }
                    case MultipleConditionLogic.failWhenTheNextInSequenceFails: {
                        if (failedRuleChecks.length > 0) {
                            flogger(`Multiple rule check - when next in sequence fails - rule FAILED`);
                            merLogger(`Multiple rule check - when next in sequence fails - rule FAILED`);
                            response.message = errorMessageBuffer;
                            response.ruleFailed = true;
                        }
                        break;
                    }
                    case MultipleConditionLogic.whenAllConditionsFailRuleShouldNotBeApplied: {
                        if ((failedRuleChecks.length === ruleChecks.length) || (failedRuleChecks.length === 0)) {
                            merLogger(`Multiple rule check - when all fail rule does not apply - rule PASSED`);
                            response.ruleFailed = false;
                            response.message = errorMessageBuffer;
                        } else {
                            flogger(`Multiple rule check - when all fail rule does not apply - rule FAILED`);
                            merLogger(`Multiple rule check - when all fail rule does not apply - rule FAILED`);
                            response.ruleFailed = true;
                            response.message = errorMessageBuffer;
                        }
                        break;
                    }
                    case MultipleConditionLogic.failOnlyIfFinalConditionIsAFailAndPreviousConditionsAreNotFails: {
                        if (failedRuleChecks.length === 1) {
                            const failedRuleIndex = failedRuleChecks[0].index;
                            // is this the last rule in the chain of conditions?
                            if (failedRuleIndex === (ruleChecks.length - 1)) {
                                flogger(`Multiple rule check - only if final is a fail, others are not fails - rule FAILED`);
                                merLogger(`Multiple rule check - only if final is a fail, others are not fails - rule FAILED`);
                                response.message = errorMessageBuffer;
                                response.ruleFailed = true;
                            }
                        }
                        break;
                    }
                }
            }
        } else {
            // no conditions, should be based on the form mode only
            if ((rule.viewMode === formMode) || (rule.viewMode === ViewMode.any)) {
                response.ruleFailed = true;
                response.message = '';
                erLogger(`Zero condition rule applied with matching form mode`);
            }
        }

        // for show and hide rules, we want the opposite effect (i.e. a success on conditions show cause the action)
        if ((response.response === ConditionResponse.hide) || (response.response === ConditionResponse.show)) {
            erLogger(`Changing show/hide rule result to opposite boolean value to cause activation if the conditions were PASSED`);
            response.ruleFailed = !response.ruleFailed;

        }
        return response;
    }

    private getRulesForFieldChange(validatableView: ValidatableView, dataFieldId: string, includeSourceFields: boolean): _ValidationRule[] {
        let rules: _ValidationRule[] = [];
        const viewMode = validatableView.getViewMode();

        // lets go through the rules for the form
        logger(`Finding rules for form ${validatableView} and data field ${dataFieldId}`);
        let index = this.viewRules.findIndex((formRule) => formRule.validatableView.getId() === validatableView.getId());
        if (index >= 0) {
            const ruleSet: ViewRuleSet = this.viewRules[index];

            // the dataFieldId could be the target or one of the sources
            ruleSet.rules.forEach((rule) => {
                // check the rule applies to the current form mode
                const ruleViewMode = rule.viewMode;
                logger(`Rule applies to mode ${ruleViewMode} (any? ${(ruleViewMode === ViewMode.any)}) and current form mode is ${viewMode}`);
                if ((ruleViewMode === ViewMode.any) ||
                    (ruleViewMode === viewMode)) {


                    if (rule.targetField.getId() === dataFieldId) {
                        logger(`Found rule where data field ${dataFieldId} is target`);
                        if (rule.targetField.isValid()) {
                            rules.push(rule);
                        } else {
                            flogger(`Found rule where data field ${dataFieldId} is target but value is not currently valid`);
                        }
                    } else {
                        if (includeSourceFields) {
                            // rule.fieldConditions.every((value: { sourceField: Field, comparison: ComparisonType }) => {
                            rule.conditions.forEach((condition) => {
                                if (condition.sourceField) {
                                    if (condition.sourceField.getId() === dataFieldId) {
                                        logger(`Found rule where data field ${dataFieldId} is source`);
                                        if (condition.sourceField.isValid()) {
                                            rules.push(rule);
                                        } else {
                                            flogger(`Found rule where data field ${dataFieldId} is source but value is not currently valid`);
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
        return rules;
    }


}
