import { StateManager } from "./StateManager";
export interface AsynchronousStateManager extends StateManager {
    getConfiguredStateNames(): string[];
    hasCompletedRun(stateName: string): boolean;
    forceResetForGet(stateName: string): void;
    setCompletedRun(stateName: string, values: any[]): void;
    isInitialised(): boolean;
    setInitialised(): void;
}
