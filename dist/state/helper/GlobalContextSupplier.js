export class GlobalContextSupplier {
    constructor() {
        this.globalContextSuppliers = [];
    }
    static getInstance() {
        if (!(GlobalContextSupplier._instance)) {
            GlobalContextSupplier._instance = new GlobalContextSupplier();
        }
        return GlobalContextSupplier._instance;
    }
    addContextSupplier(supplier) {
        this.globalContextSuppliers.push(supplier);
    }
    getGlobalContextForApi() {
        let result = {};
        this.globalContextSuppliers.forEach((supplier) => {
            const globalContextName = supplier.getStateName();
            const globalContextValue = supplier.getContextForApi();
            result[globalContextName] = globalContextValue;
        });
        return result;
    }
    getCompleteContextForApi(supplier) {
        let result = this.getGlobalContextForApi();
        const stateManagerContextName = supplier.getStateName();
        const statemanagerContextValue = supplier.getContextForApi();
        result[stateManagerContextName] = statemanagerContextValue;
        return result;
    }
}
//# sourceMappingURL=GlobalContextSupplier.js.map