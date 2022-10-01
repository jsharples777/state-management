export var ElementLocation;
(function (ElementLocation) {
    ElementLocation[ElementLocation["top"] = 0] = "top";
    ElementLocation[ElementLocation["bottom"] = 1] = "bottom";
    ElementLocation[ElementLocation["left"] = 2] = "left";
    ElementLocation[ElementLocation["right"] = 3] = "right";
    ElementLocation[ElementLocation["none"] = -1] = "none";
})(ElementLocation || (ElementLocation = {}));
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
export var FieldLabelPosition;
(function (FieldLabelPosition) {
    FieldLabelPosition[FieldLabelPosition["aboveField"] = 0] = "aboveField";
    FieldLabelPosition[FieldLabelPosition["inlineWithField"] = 1] = "inlineWithField";
    FieldLabelPosition[FieldLabelPosition["noLabel"] = 2] = "noLabel";
})(FieldLabelPosition || (FieldLabelPosition = {}));
export var UIFieldType;
(function (UIFieldType) {
    UIFieldType[UIFieldType["checkbox"] = 0] = "checkbox";
    UIFieldType[UIFieldType["email"] = 1] = "email";
    UIFieldType[UIFieldType["hidden"] = 2] = "hidden";
    UIFieldType[UIFieldType["number"] = 3] = "number";
    UIFieldType[UIFieldType["password"] = 4] = "password";
    UIFieldType[UIFieldType["text"] = 5] = "text";
    UIFieldType[UIFieldType["textarea"] = 6] = "textarea";
    UIFieldType[UIFieldType["select"] = 7] = "select";
    UIFieldType[UIFieldType["radioGroup"] = 8] = "radioGroup";
    UIFieldType[UIFieldType["tableData"] = 9] = "tableData";
    UIFieldType[UIFieldType["list"] = 10] = "list";
    UIFieldType[UIFieldType["composite"] = 11] = "composite";
    UIFieldType[UIFieldType["linked"] = 12] = "linked";
    UIFieldType[UIFieldType["linkedList"] = 13] = "linkedList";
})(UIFieldType || (UIFieldType = {}));
export const defaultGetValue = (fieldUIConfig, currentValue) => {
    let result = currentValue;
    if (fieldUIConfig.renderer) {
        let value = fieldUIConfig.renderer.renderValue(null, fieldUIConfig.field, currentValue);
        if (value)
            result = value;
    }
    if (!result) {
        result = '';
    }
    return result;
};
export const DATA_ID_ATTRIBUTE = 'data-id';
export const DRAGGABLE_KEY_ID = 'text/plain';
export const DRAGGABLE_TYPE = 'draggedType';
export const DRAGGABLE_FROM = 'draggedFrom';
//export type getIcons = (name: string, item: any) => string[];
export var ItemEventType;
(function (ItemEventType) {
    ItemEventType["SHOWN"] = "shown";
    ItemEventType["HIDDEN"] = "hidden";
    ItemEventType["CANCELLING"] = "cancelling";
    ItemEventType["CANCELLING_ABORTED"] = "cancelling-aborted";
    ItemEventType["CANCELLED"] = "cancelled";
    ItemEventType["SAVING"] = "saving";
    ItemEventType["SAVE_ABORTED"] = "save-aborted";
    ItemEventType["SAVED"] = "saved";
    ItemEventType["DELETING"] = "deleting";
    ItemEventType["DELETE_ABORTED"] = "delete-aborted";
    ItemEventType["DELETED"] = "deleted";
    ItemEventType["CREATING"] = "creating";
    ItemEventType["MODIFYING"] = "modifying";
    ItemEventType["DISPLAYING_READ_ONLY"] = "readonly";
    ItemEventType["RESETTING"] = "reset";
    ItemEventType["COMPOSITE_EDIT"] = "composite-edit";
    ItemEventType["COMPOSITE_ARRAY_EDIT"] = "composite-array-edit";
    ItemEventType["LINKED_EDIT"] = "linked-edit";
    ItemEventType["LINKED_ARRAY_EDIT"] = "linked-array-edit";
    ItemEventType["FIELD_ACTION"] = "field-action";
})(ItemEventType || (ItemEventType = {}));
export var BasicKeyAction;
(function (BasicKeyAction) {
    BasicKeyAction["ok"] = "OK";
    BasicKeyAction["cancel"] = "Cancel";
})(BasicKeyAction || (BasicKeyAction = {}));
//# sourceMappingURL=CommonTypes.js.map