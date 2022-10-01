export class DataObjectController {
    constructor(typeName) {
        this.isCreatingNew = false;
        this.typeName = typeName;
        this.listeners = [];
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    startNewObject(dataObj) {
        let result = false;
        if (!this.isCreatingNew) {
            result = this._startNewObject(dataObj);
            this.isCreatingNew = result;
        }
        return result;
    }
    isCreatingNewObject() {
        return this.isCreatingNew;
    }
    informListenersOfCreate(dataObj) {
        this.isCreatingNew = false;
        this.listeners.forEach((listener) => listener.create(this, this.typeName, dataObj));
    }
    informListenersOfUpdate(dataObj) {
        this.isCreatingNew = false;
        this.listeners.forEach((listener) => listener.update(this, this.typeName, dataObj));
    }
    informListenersOfDelete(dataObj) {
        this.isCreatingNew = false;
        this.listeners.forEach((listener) => listener.delete(this, this.typeName, dataObj));
    }
}
//# sourceMappingURL=DataObjectController.js.map