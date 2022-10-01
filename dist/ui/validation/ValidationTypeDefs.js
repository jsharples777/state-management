export var ConditionResponse;
(function (ConditionResponse) {
    ConditionResponse[ConditionResponse["show"] = 0] = "show";
    ConditionResponse[ConditionResponse["hide"] = 1] = "hide";
    ConditionResponse[ConditionResponse["invalid"] = 2] = "invalid";
    ConditionResponse[ConditionResponse["valid"] = 3] = "valid";
})(ConditionResponse || (ConditionResponse = {}));
export var MultipleConditionLogic;
(function (MultipleConditionLogic) {
    MultipleConditionLogic[MultipleConditionLogic["onlyFailIfAllConditionsFail"] = 0] = "onlyFailIfAllConditionsFail";
    MultipleConditionLogic[MultipleConditionLogic["failIfAnyConditionFails"] = 1] = "failIfAnyConditionFails";
    MultipleConditionLogic[MultipleConditionLogic["failWhenTheNextInSequenceFails"] = 2] = "failWhenTheNextInSequenceFails";
    MultipleConditionLogic[MultipleConditionLogic["whenAllConditionsFailRuleShouldNotBeApplied"] = 3] = "whenAllConditionsFailRuleShouldNotBeApplied";
    MultipleConditionLogic[MultipleConditionLogic["failOnlyIfFinalConditionIsAFailAndPreviousConditionsAreNotFails"] = 4] = "failOnlyIfFinalConditionIsAFailAndPreviousConditionsAreNotFails";
})(MultipleConditionLogic || (MultipleConditionLogic = {}));
//# sourceMappingURL=ValidationTypeDefs.js.map