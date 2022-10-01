import { GlobalContextSupplier } from "../helper/GlobalContextSupplier";
export class StateContextDelegate {
    constructor(owner, name, supplier) {
        this.owner = owner;
        this.name = name;
        this.supplier = supplier;
        this.supplier.addListener(this);
    }
    stateContextChanged(newContext) {
        this.owner.setStateByName(this.name, this.supplier.getStateFromContext(), true);
    }
    getContextForApi() {
        return GlobalContextSupplier.getInstance().getCompleteContextForApi(this.supplier);
    }
}
//# sourceMappingURL=StateContextDelegate.js.map