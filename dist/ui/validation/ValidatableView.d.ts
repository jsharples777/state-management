import { Field } from "../field/Field";
import { ViewMode } from "../../CommonTypes";
import { DataObjectDefinition } from "../../model/DataObjectTypeDefs";
export interface ValidatableView {
    getId(): string;
    getFieldFromDataFieldId(dataFieldId: string): Field | undefined;
    getViewMode(): ViewMode;
    getDataObjectDefinition(): DataObjectDefinition;
    getCurrentDataObj(): any;
}
