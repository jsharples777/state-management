import {StateContextListener} from "./StateContextListener";

export type StateManagerContext = {
    contextObjectId: string,
    contextObjectStateAttribute: string,
    contextObjectStateAttributeIsArray: boolean
}

export interface StateContextSupplier {
    addListener(listener: StateContextListener): void;

    setContext(context: any): void;

    getContext(): any | null;

    clearContext(): void;

    getContextForApi(): any;

    getStateFromContext(): any[];

    getStateName(): string;
}

