import { DataObjectDefinition, FieldDefinition } from "./DataObjectTypeDefs";
export declare class ObjectDefinitionRegistry {
    private static _instance;
    protected definitions: DataObjectDefinition[];
    private constructor();
    static getInstance(): ObjectDefinitionRegistry;
    findDefinition(id: string): DataObjectDefinition | null;
    addDefinition(id: string, displayName: string, hasDataId: boolean, dataIdIsUUID: boolean, createModifierFields?: boolean, idFieldName?: string): DataObjectDefinition;
    getFieldInDefinition(id: string, fieldId: string): FieldDefinition | null;
}
