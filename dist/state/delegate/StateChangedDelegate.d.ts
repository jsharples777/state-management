import { StateChangeInformer } from "../interface/StateChangeInformer";
import { StateEventType, stateListeners } from "../interface/StateManager";
import { StateChangeListener } from "../interface/StateChangeListener";
export declare class StateChangedDelegate implements StateChangeInformer {
    protected stateChangeListeners: stateListeners[];
    protected suppressEventEmits: boolean;
    protected managerName: string;
    constructor(managerName: string);
    suppressEvents(): void;
    emitEvents(): void;
    informChangeListenersForStateWithName(name: string, stateObjValue: any, eventType?: StateEventType, previousObjValue?: any | null): void;
    addChangeListenerForName(name: string, listener: StateChangeListener): void;
    isEmittingEvents(): boolean;
    private ensureListenerSetupForName;
}
