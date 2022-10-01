import { ManagerRequest, SimpleRequest } from "./Types";
export declare class ApiUtil {
    private static _instance;
    private static CALL_CONTEXT_HEADER;
    static getInstance(): ApiUtil;
    postFetchJSON(url: string, query: any): Promise<any>;
    apiFetchJSONWithPost(request: ManagerRequest): void;
    apiFetchJSONWithGet(request: ManagerRequest): void;
    apiFetchJSONWithDelete(request: ManagerRequest): void;
    apiFetchJSONWithPut(request: ManagerRequest): void;
    simplePOSTJSON(request: SimpleRequest): void;
    simplePUTJSON(request: SimpleRequest): void;
    simpleDELETEJSON(request: SimpleRequest): void;
    simpleGETJSON(request: SimpleRequest): void;
    simplePOSTFormData(request: SimpleRequest): void;
    private fetchJSON;
}
