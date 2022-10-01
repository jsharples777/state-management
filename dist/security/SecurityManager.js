import debug from "debug";
import { ApiUtil } from "../network/ApiUtil";
const logger = debug('security-manager');
export class SecurityManager {
    constructor() {
        this.hash = null;
        this.logoutEl = null;
        this.requiresToken = false;
        this.headerName = null;
        this.token = null;
        this.hasTokenValue = false;
        this.listeners = [];
        this.tokenURL = null;
        this.callbackForToken = this.callbackForToken.bind(this);
    }
    static getInstance() {
        if (!(SecurityManager._instance)) {
            SecurityManager._instance = new SecurityManager();
        }
        return SecurityManager._instance;
    }
    getToken() {
        return this.token;
    }
    hasToken() {
        return this.hasTokenValue;
    }
    getTokenHeaderName() {
        return this.headerName;
    }
    callsRequireToken() {
        return this.requiresToken;
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    refreshToken() {
        this.hasTokenValue = false;
        this.token = null;
        if (this.tokenURL) {
            logger(`Getting token`);
            let request = {
                url: this.tokenURL,
                body: {},
                callback: this.callbackForToken
            };
            logger(request);
            ApiUtil.getInstance().simplePOSTJSON(request);
        }
    }
    setRequiresToken(httpHeaderName = SecurityManager.HTTP_HEADER_FOR_TOKEN, tokenRequestURL = SecurityManager.DEFAULT_URL_FOR_TOKEN_REQUEST) {
        this.requiresToken = true;
        this.headerName = httpHeaderName;
        // @ts-ignore
        this.tokenURL = tokenRequestURL;
        this.refreshToken();
    }
    onDocumentLoaded(logoutElementId) {
        this.logoutEl = document.getElementById(logoutElementId);
        // find the secret hash for the current user (if any)
        const username = this.getLoggedInUsername();
        if (username && username.trim().length > 0) {
            logger(`found user ${username}`);
            this.hash = localStorage.getItem(username);
            if (this.hash) {
                sessionStorage.setItem(username, this.hash);
            }
            else {
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
    isLoggedIn() {
        let isLoggedIn = false;
        try {
            // @ts-ignore
            if (loggedInUser) {
                isLoggedIn = true;
            }
        }
        catch (error) {
        }
        return isLoggedIn;
    }
    getLoggedInUserId() {
        let result = '';
        try {
            // @ts-ignore
            if (loggedInUser) {
                // @ts-ignore
                result = loggedInUser._id;
            }
        }
        catch (error) {
        }
        logger(`Logged in user id is ${result}`);
        return result;
    }
    getLoggedInUsername() {
        let result = '';
        try {
            // @ts-ignore
            if (loggedInUser) {
                // @ts-ignore
                result = loggedInUser.username;
            }
        }
        catch (error) {
        }
        logger(`Logged in user is ${result}`);
        return result;
    }
    getCurrentUser() {
        return this.getLoggedInUserId();
    }
    encryptString(value) {
        let result = value;
        if (this.hash) {
            result = CryptoJS.AES.encrypt(value, this.hash).toString();
        }
        return result;
    }
    decryptString(value) {
        let result = value;
        if (this.hash) {
            result = CryptoJS.AES.decrypt(value, this.hash).toString(CryptoJS.enc.Utf8);
        }
        return result;
    }
    encryptObject(dataObj) {
        return this.encryptString(JSON.stringify(dataObj));
    }
    decryptObject(value) {
        return JSON.parse(this.decryptString(value));
    }
    callbackForToken(data, status) {
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
SecurityManager.HTTP_HEADER_FOR_TOKEN = 'authorization';
SecurityManager.DEFAULT_URL_FOR_TOKEN_REQUEST = '/gettoken';
//# sourceMappingURL=SecurityManager.js.map