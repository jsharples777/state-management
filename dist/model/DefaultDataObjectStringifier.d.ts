import { DataObjectStringifier } from "./DataObjectTypeDefs";
import { DataObject } from "./DataObject";
export declare class DefaultDataObjectStringifier implements DataObjectStringifier {
    toString(dataObj: DataObject): string;
    getDescription(dataObj: DataObject): string;
}
