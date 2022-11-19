var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v4 } from 'uuid';
import { queueType, RequestType } from "./Types";
import debug from 'debug';
import { CallbackRegistry } from "./CallbackRegistry";
import { OfflineManager } from "./OfflineManager";
import { ApiUtil } from "./ApiUtil";
import { SecurityManager } from "../security/SecurityManager";
const logger = debug('download-manager');
export class DownloadManager {
    constructor() {
        this.backgroundQueue = [];
        this.priorityQueue = [];
        this.inProgress = [];
        this.backgroundChangeListener = null;
        this.priorityChangeListener = null;
        this.callbackForQueueRequest = this.callbackForQueueRequest.bind(this);
        SecurityManager.getInstance().addListener(this);
    }
    static getInstance() {
        if (!(DownloadManager._instance)) {
            DownloadManager._instance = new DownloadManager();
        }
        return DownloadManager._instance;
    }
    processOfflineItems() {
        logger(`Checking for offline items`);
        OfflineManager.getInstance().processQueuedResults();
    }
    setBackgroundChangeListener(uiChangeListener) {
        this.backgroundChangeListener = uiChangeListener;
    }
    setPriorityChangeListener(uiChangeListener) {
        this.priorityChangeListener = uiChangeListener;
    }
    getPriorityQueueCount() {
        return this.priorityQueue.length;
    }
    getBackgroundQueueCount() {
        return this.backgroundQueue.length;
    }
    addQLApiRequest(url, query, variables, callbackId, state, isPriority = false) {
        let request = {
            url: url,
            type: RequestType.POST,
            params: { query: query, variables: variables },
            callbackId: callbackId,
            associatedStateName: state
        };
        this.addApiRequest(request, isPriority);
    }
    addQLMutationRequest(url, mutation, variables, callbackId, state, isPriority = false) {
        let request = {
            url: url,
            type: RequestType.POST,
            params: { mutation: mutation, variables: variables },
            callbackId: callbackId,
            associatedStateName: state
        };
        this.addApiRequest(request, isPriority);
    }
    addApiRequest(jsonRequest, isPriority = false, wasOffline = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // add a new requestId to the request for future tracking
            const requestId = v4();
            logger(`Adding Queue Request ${requestId}`);
            logger(jsonRequest);
            // are we currently offline?
            if (OfflineManager.getInstance().areWeOffline()) {
                logger(`We are offline, queueing request for when server back online.`);
                OfflineManager.getInstance().addOfflineRequest(jsonRequest);
                // let the callback function know, with a custom code to let the receiver know there was a problem
                CallbackRegistry.getInstance().getCallbackById(jsonRequest.callbackId)(jsonRequest.params, 500, jsonRequest.associatedStateName, false);
                return;
            }
            // we are online (hopefully), continue for now, we will catch offline errors later
            if (isPriority) {
                let managerRequest = {
                    originalRequest: jsonRequest,
                    requestId: requestId,
                    queueType: queueType.PRIORITY,
                    callback: this.callbackForQueueRequest,
                    wasOffline: wasOffline
                };
                this.priorityQueue.push(managerRequest);
                if (this.priorityChangeListener)
                    this.priorityChangeListener.handleEventAddToQueue();
            }
            else {
                let managerRequest = {
                    originalRequest: jsonRequest,
                    requestId: requestId,
                    queueType: queueType.BACKGROUND,
                    callback: this.callbackForQueueRequest,
                    wasOffline: wasOffline
                };
                this.backgroundQueue.push(managerRequest);
                if (this.backgroundChangeListener)
                    this.backgroundChangeListener.handleEventAddToQueue();
            }
            this.processQueues();
        });
    }
    tokenAvailable() {
        logger(`Token now available, restarting queues`);
        this.processQueues();
    }
    processPriorityQueue() {
        if (!(this.canProceed()))
            return;
        const queueItem = this.priorityQueue.shift();
        if (queueItem !== undefined) {
            this.inProgress.push(queueItem);
            this.initiateFetchForQueueItem(queueItem);
        }
    }
    processBackgroundQueue() {
        if (!(this.canProceed()))
            return;
        const queueItem = this.backgroundQueue.shift();
        if (queueItem !== undefined) {
            this.inProgress.push(queueItem);
            this.initiateFetchForQueueItem(queueItem);
        }
    }
    canProceed() {
        let result = false;
        if (SecurityManager.getInstance().callsRequireToken()) {
            if (SecurityManager.getInstance().hasToken()) {
                result = true;
            }
            else {
                logger(`Security manager requires a token and does not yet have one, pausing queues`);
            }
        }
        else {
            result = true;
        }
        return result;
    }
    processQueues() {
        // are we waiting for an authorisation token?
        if (!(this.canProceed()))
            return;
        let totalQueuedItems = this.priorityQueue.length + this.backgroundQueue.length;
        while (totalQueuedItems > 0) {
            logger(`processing queue, items remaining ${totalQueuedItems}`);
            // priority queue takes priority
            if (this.priorityQueue.length > 0) {
                this.processPriorityQueue();
            }
            else if (this.backgroundQueue.length > 0) {
                this.processBackgroundQueue();
            }
            totalQueuedItems = this.priorityQueue.length + this.backgroundQueue.length;
        }
    }
    callbackForQueueRequest(jsonData, httpStatus, queueId, requestId) {
        // let the listeners know about the completion
        if (queueId === queueType.PRIORITY) { // priority
            if (this.priorityChangeListener)
                this.priorityChangeListener.handleEventRemoveFromQueue();
        }
        else if (this.backgroundChangeListener)
            this.backgroundChangeListener.handleEventRemoveFromQueue();
        logger(`received callback for queue ${queueId} request ${requestId} with status ${httpStatus}`);
        // find the item in the in progress
        const foundIndex = this.inProgress.findIndex(element => element.requestId === requestId);
        if (foundIndex >= 0) {
            // remove from in progress
            const queueItem = this.inProgress[foundIndex];
            this.inProgress.splice(foundIndex, 1);
            logger(queueItem);
            // are we offline http status of 500
            if (httpStatus === 500) {
                logger(`queue item ${queueItem.requestId} - server offline, queueing for later`);
                OfflineManager.getInstance().addOfflineRequest(queueItem.originalRequest);
                // let the callback function know, with a custom code to let the receiver know there was a problem
                CallbackRegistry.getInstance().getCallbackById(queueItem.originalRequest.callbackId)(queueItem.originalRequest.params, httpStatus, queueItem.originalRequest.associatedStateName, queueItem.wasOffline);
            }
            else {
                logger(`finished for queue item ${queueItem.requestId} with possible offline id of ${queueItem.originalRequest._id}`);
                // let the callback function know
                CallbackRegistry.getInstance().getCallbackById(queueItem.originalRequest.callbackId)(jsonData, httpStatus, queueItem.originalRequest.associatedStateName, queueItem.wasOffline);
            }
        }
    }
    initiateFetchForQueueItem(item) {
        logger(`Download Manager: initiating fetch for queue item ${item.requestId}`);
        logger(item);
        switch (item.originalRequest.type) {
            case RequestType.POST: {
                ApiUtil.getInstance().apiFetchJSONWithPost(item);
                break;
            }
            case RequestType.GET: {
                ApiUtil.getInstance().apiFetchJSONWithGet(item);
                break;
            }
            case RequestType.DELETE: {
                ApiUtil.getInstance().apiFetchJSONWithDelete(item);
                break;
            }
            case RequestType.PUT: {
                ApiUtil.getInstance().apiFetchJSONWithPut(item);
                break;
            }
            case RequestType.PATCH: {
                ApiUtil.getInstance().apiFetchJSONWithPatch(item);
                break;
            }
        }
    }
}
//# sourceMappingURL=DownloadManager.js.map