export interface StateTimerListener {
    allConfiguredStatesAreLoaded(): void;
    stateLoaded(name: string, displayName: string): void;
}
