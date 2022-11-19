import debug from 'debug';
import {JSONRequest, ManagerCallbackFunction, ManagerRequest, queueType, SimpleRequest} from "./Types";
import {SecurityManager} from "../security/SecurityManager";
import {DownloadManager} from "./DownloadManager";

const apiLogger = debug('api-ts');
const apiResultsLogger = debug('api-ts-results');

export class ApiUtil {

    private static _instance: ApiUtil;

    private static CALL_CONTEXT_HEADER = 'API.CONTEXT.HEADER';

    public static getInstance(): ApiUtil {
        if (!(ApiUtil._instance)) {
            ApiUtil._instance = new ApiUtil();
        }
        return ApiUtil._instance;
    }

    public async postFetchJSON(url: string, query: any) {
        const postParameters = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query})
        };

        const response = await fetch(url, postParameters);
        return response.json();
    }

    /*
        Utility function for calling JSON POST requests
        Parameters:
        1.  URL to send the POST request too;
        2.  parameters object whose attribute (name/values) are the request parameters; and
        3.  A function to receive the results when the fetch has completed
            The callback function should have the following form
            callback (jsonDataReturned, httpStatusCode)
            a)  A successful fetch will return the JSON data in the first parameter and a status code of the server
            b)  Parameters that cannot be converted to JSON format will give a null data and code 404
            c)  A server error will give that code and no data
      */
    public apiFetchJSONWithPost(request: ManagerRequest): void {
        apiLogger(`Executing fetch with URL ${request.originalRequest.url} with body ${request.originalRequest.params}`);
        try {
            JSON.stringify(request.originalRequest.params);
        } catch (error) {
            apiLogger('Unable to convert parameters to JSON');
            apiLogger(request.originalRequest.params, 100);
            request.callback(null, 404, request.queueType, request.requestId);
        }
        const postParameters = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({...request.originalRequest.params}),
        };

        this.fetchJSON(request.originalRequest, postParameters, request.callback, request.queueType, request.requestId);
    }

    public apiFetchJSONWithGet(request: ManagerRequest): void {
        apiLogger(`Executing GET fetch with URL ${request.originalRequest.url} with id ${request.originalRequest.params.id}`);
        const getParameters = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        };
        if (request.originalRequest.params.id && !request.wasOffline) request.originalRequest.url += `/${request.originalRequest.params.id}`;

        this.fetchJSON(request.originalRequest, getParameters, request.callback, request.queueType, request.requestId);
    }

    public apiFetchJSONWithPatch(request: ManagerRequest): void {
        apiLogger(`Executing PATCH fetch with URL ${request.originalRequest.url} with id ${request.originalRequest.params.id} and modified date ${request.originalRequest.params.modified}`);
        const patchParameters = {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
        };
        if (request.originalRequest.params.id && !request.wasOffline) request.originalRequest.url += `/${request.originalRequest.params.id}`;
        if (request.originalRequest.params.modified && !request.wasOffline) request.originalRequest.url += `/${request.originalRequest.params.modified}`;

        this.fetchJSON(request.originalRequest, patchParameters, request.callback, request.queueType, request.requestId);
    }

    public apiFetchJSONWithDelete(request: ManagerRequest): void {
        apiLogger(`Executing DELETE fetch with URL ${request.originalRequest.url} with id ${request.originalRequest.params.id}`);
        const delParameters = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        };
        if (request.originalRequest.params.id && !request.wasOffline) request.originalRequest.url += `/${request.originalRequest.params.id}`;

        this.fetchJSON(request.originalRequest, delParameters, request.callback, request.queueType, request.requestId);
    }

    public apiFetchJSONWithPut(request: ManagerRequest) {
        apiLogger(`Executing PUT fetch with URL ${request.originalRequest.url} with id ${request.originalRequest.params.id}`);
        const putParameters = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({...request.originalRequest.params}),
        };
        if (request.originalRequest.params.id && !request.wasOffline) request.originalRequest.url += `/${request.originalRequest.params.id}`;

        this.fetchJSON(request.originalRequest, putParameters, request.callback, request.queueType, request.requestId);
    }

    public simplePOSTJSON(request: SimpleRequest) {
        let postParameters = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({...request.body})
        }

        if (request.jwt) {
            // @ts-ignore
            postParameters.headers['authorization'] = request.jwt;
        }

        fetch(request.url, postParameters)
            .then((response) => {
                apiLogger(`Response code was ${response.status}`);
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                }
                if (response.status === 400) {
                    apiResultsLogger(response.json());
                }
            })
            .then((data) => {
                apiResultsLogger(data);
                request.callback(data, 200);
            })
            .catch((error) => {
                apiLogger(error);
                request.callback(null, 500);
            });
    }

    public simplePUTJSON(request: SimpleRequest) {
        let postParameters = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({...request.body})
        }

        if (request.jwt) {
            // @ts-ignore
            postParameters.headers['authorization'] = request.jwt;
        }

        fetch(request.url, postParameters)
            .then((response) => {
                apiLogger(`Response code was ${response.status}`);
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                }
                if (response.status === 400) {
                    apiResultsLogger(response.json());
                }
            })
            .then((data) => {
                apiResultsLogger(data);
                request.callback(data, 200);
            })
            .catch((error) => {
                apiLogger(error);
                request.callback(null, 500);
            });
    }

    public simpleDELETEJSON(request: SimpleRequest) {
        let postParameters = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({...request.body})
        }

        if (request.jwt) {
            // @ts-ignore
            postParameters.headers['authorization'] = request.jwt;
        }

        fetch(request.url, postParameters)
            .then((response) => {
                apiLogger(`Response code was ${response.status}`);
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                }
                if (response.status === 400) {
                    apiResultsLogger(response.json());
                }
            })
            .then((data) => {
                apiResultsLogger(data);
                request.callback(data, 200);
            })
            .catch((error) => {
                apiLogger(error);
                request.callback(null, 500);
            });
    }


    public simpleGETJSON(request: SimpleRequest) {
        let getParameters = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
            //body:JSON.stringify({...request.body})
        }

        if (request.jwt) {
            // @ts-ignore
            postParameters.headers['authorization'] = request.jwt;
        }

        if (request.params) {
            request.params.forEach((key) => {
                request.url += `/${key}`;
            });
        }

        fetch(request.url, getParameters)
            .then((response) => {
                apiLogger(`Response code was ${response.status}`);
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                }
                if (response.status === 400) {
                    apiResultsLogger(response.json());
                }
            })
            .then((data) => {
                apiResultsLogger(data);
                request.callback(data, 200);
            })
            .catch((error) => {
                apiLogger(error);
                request.callback(null, 500);
            });
    }


    public simplePOSTFormData(request: SimpleRequest) {
        let postParameters = {
            method: 'POST',
            headers: {},
            body: request.body
        }

        if (request.jwt) {
            // @ts-ignore
            postParameters.headers['authorization'] = request.jwt;
        }

        fetch(request.url, postParameters)
            .then((response) => {
                apiLogger(`Response code was ${response.status}`);
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                }
                if (response.status === 400) {
                    apiResultsLogger(response.json());
                }
            })
            .then((data) => {
                apiResultsLogger(data);
                request.callback(data, 200, request.context);
            })
            .catch((error) => {
                apiLogger(error);
                request.callback(null, 500);
            });
    }

    private fetchJSON(originalRequest: JSONRequest, parameters: any, callback: ManagerCallbackFunction, queueType: queueType, requestId: string) {
        // do we need to add a token the headers?
        if (SecurityManager.getInstance().callsRequireToken()) {
            apiLogger(`Security Manager - requires token for API calls`);
            const headerName = SecurityManager.getInstance().getTokenHeaderName();
            const token = SecurityManager.getInstance().getToken();
            apiLogger(`Header: ${headerName}:${token}`);
            // @ts-ignore
            parameters.headers[headerName] = token;
        }

        if (originalRequest.context) {
            parameters.headers[ApiUtil.CALL_CONTEXT_HEADER] = JSON.stringify(originalRequest.context);
        }


        fetch(originalRequest.url, parameters)
            .then((response) => {
                apiLogger(`Response code was ${response.status}`);
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                }
                if (response.status === 400) {
                    apiResultsLogger(response.json());
                }
                if (response.status === 403) { // possibly web token expiry
                    apiResultsLogger(`Forbidden request`);
                    if (SecurityManager.getInstance().callsRequireToken()) {
                        apiLogger(`Refreshing token and putting request back into the queue`);
                        // ask for a new token
                        SecurityManager.getInstance().refreshToken();
                        // re-queue the request
                        DownloadManager.getInstance().addApiRequest(originalRequest, true, false);
                    } else {
                        apiResultsLogger(response.json());
                    }

                }
            })
            .then((data) => {
                apiResultsLogger(data);
                callback(data, 200, queueType, requestId);
            })
            .catch((error) => {
                apiLogger(error);
                callback(originalRequest.params, 500, queueType, requestId);
            });
    }
}

