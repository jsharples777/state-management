import {DataObjectDefinition} from "./DataObjectTypeDefs";


export interface DataObject {
    getUniqueId(): string;

    toString(): string;

    getDescription(): string;

    getValue(fieldName: string): string | null;

    setValue(fieldName: string, value: any): void;

    isEqual(secondDataObj: DataObject): boolean;

    // meta methods
    getDefinition(): DataObjectDefinition;

    getTypeName(): string;

    isNew(): boolean;

    setNew(): void;

    isPersisted(): boolean;

    setPersisted(persisted: boolean): void;

    isComplete(): boolean;

    setComplete(): void;

    hasChanged(): boolean;

    setChanged(): void;

    // instance management
    clone(): DataObject;

    instance(): DataObject;

    // persistent
    persist(): void;

    delete(): void;

    getData(): any;

}
