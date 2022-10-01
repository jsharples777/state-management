import debug from "debug";
const logger = debug('callback-registry');
export class CallbackRegistry {
    constructor() {
        this.callbacks = [];
    }
    static getInstance() {
        if (!(CallbackRegistry._instance)) {
            CallbackRegistry._instance = new CallbackRegistry();
        }
        return CallbackRegistry._instance;
    }
    addRegisterCallback(id, fn) {
        logger(`Adding callback function with id ${id}`);
        this.callbacks.push({ id: id, fn: fn });
    }
    getCallbackById(id) {
        const defaultFn = function (data, status, associatedStateName) {
            console.error(`Callback received with status ${status}, state name ${associatedStateName} where the callback was never registered`);
        };
        const foundIndex = this.callbacks.findIndex((callback) => callback.id === id);
        if (foundIndex >= 0) {
            return this.callbacks[foundIndex].fn;
        }
        return defaultFn;
    }
}
//# sourceMappingURL=CallbackRegistry.js.map