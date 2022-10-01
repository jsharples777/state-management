import {DataObjectDefinition, FieldDefinition} from "./DataObjectTypeDefs";
import {BasicObjectDefinitionFactory, FIELD_ID} from "./BasicObjectDefinitionFactory";
import debug from "debug";

const logger = debug('object-definition-registry');

export class ObjectDefinitionRegistry {
    private static _instance: ObjectDefinitionRegistry;
    protected definitions: DataObjectDefinition[];

    private constructor() {
        this.definitions = [];
    }

    public static getInstance(): ObjectDefinitionRegistry {
        if (!(ObjectDefinitionRegistry._instance)) {
            ObjectDefinitionRegistry._instance = new ObjectDefinitionRegistry();
        }
        return ObjectDefinitionRegistry._instance;
    }

    public findDefinition(id: string): DataObjectDefinition | null {
        let result: DataObjectDefinition | null = null;
        const index = this.definitions.findIndex((definition) => definition.id === id);
        if (index >= 0) {
            result = this.definitions[index];
        }
        return result;
    }

    public addDefinition(id: string, displayName: string, hasDataId: boolean, dataIdIsUUID: boolean, createModifierFields: boolean = true, idFieldName: string = FIELD_ID): DataObjectDefinition {
        logger(`Adding definition for ${id} with name ${displayName}`);
        let result: DataObjectDefinition | null = this.findDefinition(id);
        if (result) {
            return result;
        } else {
            let definition = BasicObjectDefinitionFactory.getInstance().createBasicObjectDefinition(id, displayName, hasDataId, dataIdIsUUID, createModifierFields, idFieldName);
            this.definitions.push(definition);
            return definition;
        }
    }

    public getFieldInDefinition(id:string, fieldId:string): FieldDefinition | null {
        let result:FieldDefinition|null = null;
        const def = this.findDefinition(id);
        if (def) {
            def.fields.forEach((fieldDef) => {
                if (fieldDef.id === fieldId) {
                    result = fieldDef;
                }
            })
        }

        return result;

    }


}
