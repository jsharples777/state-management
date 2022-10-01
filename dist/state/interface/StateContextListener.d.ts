export interface StateContextListener {
    stateContextChanged(newContext: any | null): void;
}
