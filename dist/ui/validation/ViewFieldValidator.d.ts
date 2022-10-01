import { FieldDefinition } from "../../model/DataObjectTypeDefs";
import { ConditionResponse } from "./ValidationTypeDefs";
import { RuleCheck } from "./ValidationManager";
import { ValidatableView } from "./ValidatableView";
import { ViewMode } from "../../CommonTypes";
export interface ViewFieldValidator {
    applyRulesToTargetField(validatableView: ValidatableView, viewMode: ViewMode, field: FieldDefinition, onlyRulesOfType: ConditionResponse | null): RuleCheck;
}
