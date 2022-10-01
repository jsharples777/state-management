export var UndefinedBoolean;
(function (UndefinedBoolean) {
    UndefinedBoolean[UndefinedBoolean["true"] = 1] = "true";
    UndefinedBoolean[UndefinedBoolean["false"] = 0] = "false";
})(UndefinedBoolean || (UndefinedBoolean = {}));
export var ComparisonType;
(function (ComparisonType) {
    ComparisonType[ComparisonType["equals"] = 0] = "equals";
    ComparisonType[ComparisonType["lessThan"] = 1] = "lessThan";
    ComparisonType[ComparisonType["lessThanEqual"] = 2] = "lessThanEqual";
    ComparisonType[ComparisonType["greaterThan"] = 3] = "greaterThan";
    ComparisonType[ComparisonType["greaterThanEqual"] = 4] = "greaterThanEqual";
    ComparisonType[ComparisonType["isNull"] = 5] = "isNull";
    ComparisonType[ComparisonType["isNotNull"] = 6] = "isNotNull";
    ComparisonType[ComparisonType["hasValue"] = 7] = "hasValue";
    ComparisonType[ComparisonType["isNotValue"] = 8] = "isNotValue";
})(ComparisonType || (ComparisonType = {}));
export var ViewMode;
(function (ViewMode) {
    ViewMode[ViewMode["unset"] = -1] = "unset";
    ViewMode[ViewMode["create"] = 0] = "create";
    ViewMode[ViewMode["update"] = 1] = "update";
    ViewMode[ViewMode["displayOnly"] = 2] = "displayOnly";
    ViewMode[ViewMode["any"] = 3] = "any";
})(ViewMode || (ViewMode = {}));
export var KeyType;
(function (KeyType) {
    KeyType[KeyType["number"] = 0] = "number";
    KeyType[KeyType["string"] = 1] = "string";
    KeyType[KeyType["boolean"] = 2] = "boolean";
    KeyType[KeyType["collection"] = 3] = "collection";
})(KeyType || (KeyType = {}));
export const DATA_ID_ATTRIBUTE = 'data-id';
//# sourceMappingURL=CommonTypes.js.map