import {StateContextListener} from "../interface/StateContextListener";
import {StateManager} from "../interface/StateManager";
import {StateContextSupplier} from "../interface/StateContextSupplier";
import {GlobalContextSupplier} from "../helper/GlobalContextSupplier";

export class StateContextDelegate implements StateContextListener {
    private owner: StateManager;
    private name: string;
    private supplier: StateContextSupplier;

    public constructor(owner: StateManager, name: string, supplier: StateContextSupplier) {
        this.owner = owner;
        this.name = name;
        this.supplier = supplier;
        this.supplier.addListener(this);
    }

    stateContextChanged(newContext: any): void {
        this.owner.setStateByName(this.name, this.supplier.getStateFromContext(), true);
    }

    public getContextForApi(): any {
        return GlobalContextSupplier.getInstance().getCompleteContextForApi(this.supplier);
    }


}
