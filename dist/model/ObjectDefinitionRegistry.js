import { BasicObjectDefinitionFactory, FIELD_ID } from "./BasicObjectDefinitionFactory";
import debug from "debug";
const logger = debug('object-definition-registry');
export class ObjectDefinitionRegistry {
    constructor() {
        this.definitions = [];
    }
    static getInstance() {
        if (!(ObjectDefinitionRegistry._instance)) {
            ObjectDefinitionRegistry._instance = new ObjectDefinitionRegistry();
        }
        return ObjectDefinitionRegistry._instance;
    }
    findDefinition(id) {
        let result = null;
        const index = this.definitions.findIndex((definition) => definition.id === id);
        if (index >= 0) {
            result = this.definitions[index];
        }
        return result;
    }
    addDefinition(id, displayName, hasDataId, dataIdIsUUID, createModifierFields = true, idFieldName = FIELD_ID) {
        logger(`Adding definition for ${id} with name ${displayName}`);
        let result = this.findDefinition(id);
        if (result) {
            return result;
        }
        else {
            let definition = BasicObjectDefinitionFactory.getInstance().createBasicObjectDefinition(id, displayName, hasDataId, dataIdIsUUID, createModifierFields, idFieldName);
            this.definitions.push(definition);
            return definition;
        }
    }
    getFieldInDefinition(id, fieldId) {
        let result = null;
        const def = this.findDefinition(id);
        if (def) {
            def.fields.forEach((fieldDef) => {
                if (fieldDef.id === fieldId) {
                    result = fieldDef;
                }
            });
        }
        return result;
    }
}
//# sourceMappingURL=ObjectDefinitionRegistry.js.map