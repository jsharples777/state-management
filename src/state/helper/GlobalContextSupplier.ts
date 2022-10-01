import {StateContextSupplier} from "../interface/StateContextSupplier";

export class GlobalContextSupplier {
    private static _instance: GlobalContextSupplier;

    private globalContextSuppliers: StateContextSupplier[];

    private constructor() {
        this.globalContextSuppliers = [];
    }

    public static getInstance() {
        if (!(GlobalContextSupplier._instance)) {
            GlobalContextSupplier._instance = new GlobalContextSupplier();
        }
        return GlobalContextSupplier._instance;
    }

    public addContextSupplier(supplier: StateContextSupplier): void {
        this.globalContextSuppliers.push(supplier);
    }

    public getGlobalContextForApi(): any {
        let result: any = {};
        this.globalContextSuppliers.forEach((supplier) => {
            const globalContextName = supplier.getStateName();
            const globalContextValue = supplier.getContextForApi();
            result[globalContextName] = globalContextValue;

        })
        return result;
    }

    public getCompleteContextForApi(supplier: StateContextSupplier): any {
        let result: any = this.getGlobalContextForApi();
        const stateManagerContextName = supplier.getStateName();
        const statemanagerContextValue = supplier.getContextForApi();
        result[stateManagerContextName] = statemanagerContextValue;
        return result;
    }
}
