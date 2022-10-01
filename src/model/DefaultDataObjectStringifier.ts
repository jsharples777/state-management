import {DataObjectStringifier, FieldType} from "./DataObjectTypeDefs";
import {DataObject} from "./DataObject";

export class DefaultDataObjectStringifier implements DataObjectStringifier {

    toString(dataObj: DataObject): string {
        let result = '';
        if (dataObj) {
            const def = dataObj.getDefinition();
            // assume the first non identifier field that is not hidden is the string to display
            let done = false;
            let index = 0;
            while (!done) {
                if (index < def.fields.length) {
                    const fieldDef = def.fields[index];
                    if ((fieldDef.type !== FieldType.uuid) && (fieldDef.type !== FieldType.id) && (fieldDef.type !== FieldType.userId)) {
                        const value = dataObj.getValue(fieldDef.id);
                        if (value) {
                            result = value + '';
                        }
                        done = true;
                    }
                } else {
                    done = true;
                }
                index++;
            }
        }


        return result;
    }

    getDescription(dataObj: DataObject): string {
        return this.toString(dataObj);
    }

}
