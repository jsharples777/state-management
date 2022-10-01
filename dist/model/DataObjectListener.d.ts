import { DataObjectController } from "./DataObjectController";
export interface DataObjectListener {
    create(controller: DataObjectController | null, typeName: string, dataObj: any): void;
    update(controller: DataObjectController | null, typeName: string, dataObj: any): void;
    delete(controller: DataObjectController | null, typeName: string, dataObj: any): void;
}
