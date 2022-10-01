import { StateContextListener } from "../interface/StateContextListener";
import { StateManager } from "../interface/StateManager";
import { StateContextSupplier } from "../interface/StateContextSupplier";
export declare class StateContextDelegate implements StateContextListener {
    private owner;
    private name;
    private supplier;
    constructor(owner: StateManager, name: string, supplier: StateContextSupplier);
    stateContextChanged(newContext: any): void;
    getContextForApi(): any;
}
