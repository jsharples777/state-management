import { QueueListener } from "./QueueListener";
import { JSONRequest, ManagerRequest } from "./Types";
import { TokenListener } from "../security/TokenListener";
export declare class DownloadManager implements TokenListener {
    private static _instance;
    protected backgroundQueue: ManagerRequest[];
    protected priorityQueue: ManagerRequest[];
    protected inProgress: ManagerRequest[];
    protected backgroundChangeListener: QueueListener | null;
    protected priorityChangeListener: QueueListener | null;
    constructor();
    static getInstance(): DownloadManager;
    processOfflineItems(): void;
    setBackgroundChangeListener(uiChangeListener: QueueListener): void;
    setPriorityChangeListener(uiChangeListener: QueueListener): void;
    getPriorityQueueCount(): number;
    getBackgroundQueueCount(): number;
    addQLApiRequest(url: string, query: string, variables: any, callbackId: string, state: string, isPriority?: boolean): void;
    addQLMutationRequest(url: string, mutation: string, variables: any, callbackId: string, state: string, isPriority?: boolean): void;
    addApiRequest(jsonRequest: JSONRequest, isPriority?: boolean, wasOffline?: boolean): Promise<void>;
    tokenAvailable(): void;
    private processPriorityQueue;
    private processBackgroundQueue;
    private canProceed;
    private processQueues;
    private callbackForQueueRequest;
    private initiateFetchForQueueItem;
}
