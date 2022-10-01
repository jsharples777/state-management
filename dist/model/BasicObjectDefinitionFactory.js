import { BasicFieldOperations } from "./BasicFieldOperations";
import { FieldType } from "./DataObjectTypeDefs";
import { KeyType } from "../CommonTypes";
import { DefaultDataObjectStringifier } from "./DefaultDataObjectStringifier";
export const FIELD_ID = 'id';
export const FIELD_CreatedBy = 'createdBy';
export const FIELD_ModifiedBy = 'modifiedBy';
export const FIELD_CreatedOn = 'createdOn';
export const FIELD_ModifiedOn = 'modifiedOn';
export const FIELD_CreatedBy_Desc = 'Created By';
export const FIELD_ModifiedBy_Desc = 'Last Modified By';
export const FIELD_CreatedOn_Desc = 'Created On';
export const FIELD_ModifiedOn_Desc = 'Last Modified On';
export class BasicObjectDefinitionFactory {
    constructor() {
        this.ops = new BasicFieldOperations();
    }
    static getInstance() {
        if (!(BasicObjectDefinitionFactory._instance)) {
            BasicObjectDefinitionFactory._instance = new BasicObjectDefinitionFactory();
        }
        return BasicObjectDefinitionFactory._instance;
    }
    generateStartingDisplayOrder(dataObjDef) {
        let result = [];
        dataObjDef.fields.forEach((fieldDef, index) => {
            let order = {
                fieldId: fieldDef.id,
                displayOrder: index
            };
            // is this the created or modified date
            if (fieldDef.id === FIELD_CreatedOn) {
                order.displayOrder += 100;
            }
            if (fieldDef.id === FIELD_ModifiedOn) {
                order.displayOrder += 101;
            }
            if (fieldDef.type === FieldType.userId) {
                order.displayOrder += 100;
            }
            result.push(order);
        });
        return result;
    }
    createBasicObjectDefinition(id, displayName, hasDataId, dataIdIsUUID, createModifierFields = true, idFieldName = FIELD_ID) {
        let objDef = {
            id: id,
            displayName: displayName,
            convertToString: new DefaultDataObjectStringifier(),
            fields: []
        };
        // do we need an id field?
        if (hasDataId) {
            let fieldType = FieldType.id;
            if (dataIdIsUUID) {
                fieldType = FieldType.uuid;
            }
            let fieldDef = {
                id: idFieldName,
                isKey: true,
                idType: KeyType.number,
                type: fieldType,
                displayName: 'Id',
                mandatory: true,
                generator: {
                    generator: this.ops,
                    onModify: false,
                    onCreation: true
                }
            };
            objDef.fields.push(fieldDef);
        }
        // add fields for created and modified
        if (createModifierFields) {
            this.addCreatedDateToArray(objDef.fields);
            this.addCreatedByToArray(objDef.fields);
            this.addModifiedByToArray(objDef.fields);
            this.addModifiedDateToArray(objDef.fields);
        }
        return objDef;
    }
    addStringFieldToObjDefinition(objDef, id, displayName, type, isMandatory = false, description = null, datasource = null) {
        return this.addStringFieldToArray(objDef.fields, id, displayName, type, isMandatory, description, datasource);
    }
    addAnyFieldToObjDefinition(objDef, id, displayName) {
        return this.addStringFieldToArray(objDef.fields, id, displayName, FieldType.ANY, false);
    }
    addNumericFieldToObjDefinition(objDef, id, displayName, type, isMandatory = false, description = null, datasource = null) {
        return this.addNumericFieldToArray(objDef.fields, id, displayName, type, isMandatory, description, datasource);
    }
    addDerivedFieldToObjDefinition(objDef, id, displayName, type, keyType, calculator, isMandatory = false, description = null, dataSource = null) {
        let fieldDef;
        if (keyType === KeyType.number) {
            fieldDef = this.addNumericFieldToObjDefinition(objDef, id, displayName, type, isMandatory, description, dataSource);
        }
        else {
            fieldDef = this.addStringFieldToObjDefinition(objDef, id, displayName, type, isMandatory, description, dataSource);
        }
        fieldDef.derivedValue = calculator;
        return fieldDef;
    }
    addCreatedDateToArray(fields) {
        let fieldDef = this.addStringFieldToArray(fields, FIELD_CreatedOn, FIELD_CreatedOn_Desc, FieldType.datetime, true, FIELD_CreatedOn_Desc);
        // add generator
        fieldDef.generator = {
            generator: this.ops,
            onCreation: true,
            onModify: false
        };
        fieldDef.displayOnly = true;
    }
    addModifiedDateToArray(fields) {
        let fieldDef = this.addStringFieldToArray(fields, FIELD_ModifiedOn, FIELD_ModifiedOn_Desc, FieldType.datetime, true, FIELD_ModifiedOn_Desc);
        // add generator
        fieldDef.generator = {
            generator: this.ops,
            onCreation: true,
            onModify: true
        };
        fieldDef.displayOnly = true;
    }
    addCreatedByToArray(fields) {
        let fieldDef = this.addNumericFieldToArray(fields, FIELD_CreatedBy, FIELD_CreatedBy_Desc, FieldType.userId, true, FIELD_CreatedBy_Desc);
        // add generator
        fieldDef.generator = {
            generator: this.ops,
            onCreation: true,
            onModify: false
        };
        fieldDef.displayOnly = true;
    }
    addModifiedByToArray(fields) {
        let fieldDef = this.addStringFieldToArray(fields, FIELD_ModifiedBy, FIELD_ModifiedBy_Desc, FieldType.userId, true, FIELD_ModifiedBy_Desc);
        // add generator
        fieldDef.generator = {
            generator: this.ops,
            onCreation: true,
            onModify: true
        };
        fieldDef.displayOnly = true;
    }
    addFieldToArray(fields, keyType, id, displayName, type, isMandatory = false, description = null, datasource = null) {
        let fieldDef = {
            id: id,
            isKey: false,
            idType: keyType,
            type: type,
            displayName: displayName,
            mandatory: isMandatory,
            displayOnly: false,
        };
        if (isMandatory) {
            // add generator
            fieldDef.generator = {
                generator: this.ops,
                onCreation: true,
                onModify: false
            };
        }
        if (description)
            fieldDef.description = description;
        if (datasource)
            fieldDef.dataSource = datasource;
        fields.push(fieldDef);
        return fieldDef;
    }
    addStringFieldToArray(fields, id, displayName, type, isMandatory = false, description = null, datasource = null) {
        return this.addFieldToArray(fields, KeyType.string, id, displayName, type, isMandatory, description, datasource);
    }
    addNumericFieldToArray(fields, id, displayName, type, isMandatory = false, description = null, datasource = null) {
        return this.addFieldToArray(fields, KeyType.string, id, displayName, type, isMandatory, description, datasource);
    }
}
//# sourceMappingURL=BasicObjectDefinitionFactory.js.map