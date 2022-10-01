import { FieldDefinition } from "../../model/DataObjectTypeDefs";
import { ConditionResponse, RuleCheck } from "./ValidationTypeDefs";
import { ValidatableView } from "./ValidatableView";
import { ViewMode } from "../../CommonTypes";
export interface ViewFieldValidator {
    applyRulesToTargetField(validatableView: ValidatableView, viewMode: ViewMode, field: FieldDefinition, onlyRulesOfType: ConditionResponse | null): RuleCheck;
}
