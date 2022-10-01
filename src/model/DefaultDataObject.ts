import {DataObject} from "./DataObject";
import {DataObjectDefinition, FieldType} from "./DataObjectTypeDefs";
import {AbstractFieldOperations} from "./AbstractFieldOperations";
import debug from "debug";
import {copyObject} from "../util/MiscFunctions";
import {DataObjectFactory} from "./DataObjectFactory";
import {DataObjectPersistenceManager} from "./DataObjectPersistenceManager";

const logger = debug('default-data-object');

export class DefaultDataObject implements DataObject {
    private data: any;
    private definition: DataObjectDefinition;
    private fieldOps: AbstractFieldOperations;
    private bIsPersisted: boolean = true;
    private bIsComplete: boolean = true;
    private bHasChanged: boolean = false;
    private bIsNew: boolean = false;

    constructor(definition: DataObjectDefinition, data: any, fieldOps: AbstractFieldOperations) {
        this.data = data;
        Object.assign(this, data);

        this.definition = definition;
        this.fieldOps = fieldOps;
        this.setPersisted(true);
    }


    public isNew(): boolean {
        return this.bIsNew;
    }

    setPersisted(persisted: boolean): void {
        this.bHasChanged = !persisted;
        this.bIsPersisted = persisted;
        this.bIsComplete = persisted;
        this.bIsNew = !persisted;
    }

    setComplete(): void {
        this.bIsComplete = true;
    }

    hasChanged(): boolean {
        return this.bHasChanged;
    }

    toString(): string {
        return this.getDefinition().convertToString.toString(this);
    }

    isEqual(secondDataObj: DataObject): boolean {
        let result = false;
        if (this.getTypeName() === secondDataObj.getTypeName()) {
            if (this.getUniqueId() === secondDataObj.getUniqueId()) {
                result = true;
            }
        }
        return result;
    }

    getDefinition(): DataObjectDefinition {
        return this.definition;
    }

    getDescription(): string {
        return this.getDefinition().convertToString.getDescription(this.data);
    }

    getTypeName(): string {
        return this.getDefinition().id;
    }

    getUniqueId(): string {
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
            } else {
                done = true;
            }
        }
        return result;
    }

    getValue(fieldName: string): string | null {
        let result: string | null = '';
        const foundIndex = this.definition.fields.findIndex((field) => field.id === fieldName);
        if (foundIndex >= 0) {
            const fieldDef = this.definition.fields[foundIndex];
            const value = this.data[fieldName];
            result = this.fieldOps.renderValue(null, fieldDef, value);
        }
        return result;
    }

    isComplete(): boolean {
        return this.bIsComplete;
    }

    isPersisted(): boolean {
        return this.bIsPersisted;
    }

    setValue(fieldName: string, value: any): void {
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

    setNew(): void {
        this.bIsNew = true;
    }

    public setChanged(): void {
        this.bHasChanged = true;
    }

    clone(): DataObject {
        const dataCopy = copyObject(this.data);
        const result = new DefaultDataObject(this.definition, dataCopy, this.fieldOps);
        if (this.isPersisted()) result.setPersisted(true);
        if (this.isNew()) result.setNew();
        if (this.hasChanged()) result.setChanged();
        return result;
    }


    instance(): DataObject {
        return DataObjectFactory.getInstance().instance(this.definition, this.fieldOps);
    }

    // persistent
    persist(): void {
        DataObjectPersistenceManager.getInstance().persist(this);
    }

    delete(): void {
        DataObjectPersistenceManager.getInstance().delete(this);
    }

    getData(): any {
        return this.data;
    }
}
