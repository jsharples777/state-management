import { StateContextSupplier } from "../interface/StateContextSupplier";
export declare class GlobalContextSupplier {
    private static _instance;
    private globalContextSuppliers;
    private constructor();
    static getInstance(): GlobalContextSupplier;
    addContextSupplier(supplier: StateContextSupplier): void;
    getGlobalContextForApi(): any;
    getCompleteContextForApi(supplier: StateContextSupplier): any;
}
