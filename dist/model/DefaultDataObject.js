import { FieldType } from "./DataObjectTypeDefs";
import debug from "debug";
import { copyObject } from "../util/MiscFunctions";
import { DataObjectFactory } from "./DataObjectFactory";
import { DataObjectPersistenceManager } from "./DataObjectPersistenceManager";
const logger = debug('default-data-object');
export class DefaultDataObject {
    constructor(definition, data, fieldOps) {
        this.bIsPersisted = true;
        this.bIsComplete = true;
        this.bHasChanged = false;
        this.bIsNew = false;
        this.data = data;
        Object.assign(this, data);
        this.definition = definition;
        this.fieldOps = fieldOps;
        this.setPersisted(true);
    }
    isNew() {
        return this.bIsNew;
    }
    setPersisted(persisted) {
        this.bHasChanged = !persisted;
        this.bIsPersisted = persisted;
        this.bIsComplete = persisted;
        this.bIsNew = !persisted;
    }
    setComplete() {
        this.bIsComplete = true;
    }
    hasChanged() {
        return this.bHasChanged;
    }
    toString() {
        return this.getDefinition().convertToString.toString(this);
    }
    isEqual(secondDataObj) {
        let result = false;
        if (this.getTypeName() === secondDataObj.getTypeName()) {
            if (this.getUniqueId() === secondDataObj.getUniqueId()) {
                result = true;
            }
        }
        return result;
    }
    getDefinition() {
        return this.definition;
    }
    getDescription() {
        return this.getDefinition().convertToString.getDescription(this.data);
    }
    getTypeName() {
        return this.getDefinition().id;
    }
    getUniqueId() {
        let result = '';
        let done = false;
        let index = 0;
        while (!done) {
            if (index < this.definition.fields.length) {
                const fieldDef = this.definition.fields[index];
                if ((fieldDef.type === FieldType.uuid) || (fieldDef.type === FieldType.id)) {
                    const value = this.getValue(fieldDef.id);
                    if (value) {
                        result = value + '';
                    }
                    done = true;
                }
            }
            else {
                done = true;
            }
        }
        return result;
    }
    getValue(fieldName) {
        let result = '';
        const foundIndex = this.definition.fields.findIndex((field) => field.id === fieldName);
        if (foundIndex >= 0) {
            const fieldDef = this.definition.fields[foundIndex];
            const value = this.data[fieldName];
            result = this.fieldOps.renderValue(null, fieldDef, value);
        }
        return result;
    }
    isComplete() {
        return this.bIsComplete;
    }
    isPersisted() {
        return this.bIsPersisted;
    }
    setValue(fieldName, value) {
        const foundIndex = this.definition.fields.findIndex((field) => field.id === fieldName);
        if (foundIndex >= 0) {
            const fieldDef = this.definition.fields[foundIndex];
            const value = this.data[fieldName];
            const newValue = this.fieldOps.formatValue(fieldDef, value);
            this.data[fieldName] = newValue;
            // @ts-ignore
            this[fieldName] = newValue;
            this.bHasChanged = true;
        }
    }
    setNew() {
        this.bIsNew = true;
    }
    setChanged() {
        this.bHasChanged = true;
    }
    clone() {
        const dataCopy = copyObject(this.data);
        const result = new DefaultDataObject(this.definition, dataCopy, this.fieldOps);
        if (this.isPersisted())
            result.setPersisted(true);
        if (this.isNew())
            result.setNew();
        if (this.hasChanged())
            result.setChanged();
        return result;
    }
    instance() {
        return DataObjectFactory.getInstance().instance(this.definition, this.fieldOps);
    }
    // persistent
    persist() {
        DataObjectPersistenceManager.getInstance().persist(this);
    }
    delete() {
        DataObjectPersistenceManager.getInstance().delete(this);
    }
    getData() {
        return this.data;
    }
}
//# sourceMappingURL=DefaultDataObject.js.map