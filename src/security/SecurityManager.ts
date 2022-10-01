import debug from "debug";
import {TokenListener} from "./TokenListener";
import {SimpleRequest} from "../network/Types";
import {ApiUtil} from "../network/ApiUtil";

const logger = debug('security-manager');

export class SecurityManager {
    public static HTTP_HEADER_FOR_TOKEN = 'authorization';
    public static DEFAULT_URL_FOR_TOKEN_REQUEST = '/gettoken';


    private static _instance: SecurityManager;
    private hash: string | null = null;
    private logoutEl: HTMLElement | null = null;
    private requiresToken: boolean = false;
    private headerName: string | null = null;
    private token: any | null = null;
    private hasTokenValue: boolean = false;
    private listeners: TokenListener[] = [];
    private tokenURL: string | null = null;

    private constructor() {
        this.callbackForToken = this.callbackForToken.bind(this);
    }

    public static getInstance(): SecurityManager {
        if (!(SecurityManager._instance)) {
            SecurityManager._instance = new SecurityManager();
        }
        return SecurityManager._instance;
    }

    public getToken(): any | null {
        return this.token;
    }

    public hasToken(): boolean {
        return this.hasTokenValue;
    }

    public getTokenHeaderName(): string | null {
        return this.headerName;
    }

    public callsRequireToken(): boolean {
        return this.requiresToken;
    }

    public addListener(listener: TokenListener) {
        this.listeners.push(listener);
    }

    public refreshToken() {
        this.hasTokenValue = false;
        this.token = null;

        if (this.tokenURL) {
            logger(`Getting token`);
            let request: SimpleRequest = {
                url: this.tokenURL,
                body: {},
                callback: this.callbackForToken
            }
            logger(request);
            ApiUtil.getInstance().simplePOSTJSON(request);
        }
    }

    public setRequiresToken(httpHeaderName: string | null = SecurityManager.HTTP_HEADER_FOR_TOKEN, tokenRequestURL: string | null = SecurityManager.DEFAULT_URL_FOR_TOKEN_REQUEST): void {
        this.requiresToken = true;
        this.headerName = httpHeaderName;
        // @ts-ignore
        this.tokenURL = tokenRequestURL;
        this.refreshToken();
    }

    public onDocumentLoaded(logoutElementId: string) {
        this.logoutEl = document.getElementById(logoutElementId);

        // find the secret hash for the current user (if any)
        const username = this.getLoggedInUsername();
        if (username && username.trim().length > 0) {
            logger(`found user ${username}`);
            this.hash = localStorage.getItem(username);
            if (this.hash) {
                sessionStorage.setItem(username, this.hash);
            } else {
                this.hash = sessionStorage.getItem(username);
            }
            localStorage.removeItem(username);
            logger(`found user ${username} hash - removed from local storage`);
        }

        if (this.logoutEl) {
            this.logoutEl.addEventListener('click', (event) => {
                localStorage.removeItem(username);
                sessionStorage.removeItem(username);
            });
        }
    }

    public isLoggedIn(): boolean {
        let isLoggedIn = false;
        try {
            // @ts-ignore
            if (loggedInUser) {
                isLoggedIn = true;
            }
        } catch (error) {
        }
        return isLoggedIn;
    }

    public getLoggedInUserId(): string {
        let result = '';
        try {
            // @ts-ignore
            if (loggedInUser) {
                // @ts-ignore
                result = loggedInUser._id;
            }
        } catch (error) {
        }
        logger(`Logged in user id is ${result}`);
        return result;
    }

    public getLoggedInUsername(): string {
        let result = '';
        try {
            // @ts-ignore
            if (loggedInUser) {
                // @ts-ignore
                result = loggedInUser.username;
            }
        } catch (error) {
        }
        logger(`Logged in user is ${result}`);
        return result;
    }

    public getCurrentUser(): string {
        return this.getLoggedInUserId();
    }

    public encryptString(value: string): string {
        let result = value;
        if (this.hash) {
            result = CryptoJS.AES.encrypt(value, this.hash).toString();
        }
        return result;
    }

    public decryptString(value: string): string {
        let result = value;
        if (this.hash) {
            result = CryptoJS.AES.decrypt(value, this.hash).toString(CryptoJS.enc.Utf8);
        }
        return result;
    }

    public encryptObject(dataObj: any): string {
        return this.encryptString(JSON.stringify(dataObj));
    }

    public decryptObject(value: string): any {
        return JSON.parse(this.decryptString(value));
    }

    protected callbackForToken(data: any, status: number): void {
        logger(`Callback - Getting token`);
        if (status === 200) {
            logger(`Token received`);
            logger(data);
            this.token = data;
            this.hasTokenValue = true;
            this.listeners.forEach((listener) => listener.tokenAvailable());
        }
    }
}
