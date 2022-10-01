import debug from "debug";
const logger = debug('poller');
export class Poller {
    constructor() {
        this.interval = null;
        this.isPollingBool = false;
    }
    static getInstance() {
        if (!(Poller._instance)) {
            Poller._instance = new Poller();
        }
        return Poller._instance;
    }
    startPolling(callback, delay = Poller.INTERVAL_DEFAULT) {
        this.isPollingBool = true;
        this.interval = setInterval(() => {
            logger(`Checking for server availability`);
            fetch(Poller.URL_CALL, { method: 'GET' }).then((response) => {
                logger(`Response code was ${response.status} - server is now available`);
                this.stopPolling();
                callback();
            }).catch((error) => {
                logger(error);
            });
        }, delay);
    }
    isPolling() {
        return this.isPollingBool;
    }
    stopPolling() {
        if (this.interval)
            clearInterval(this.interval);
        this.interval = null;
        this.isPollingBool = false;
    }
}
Poller.INTERVAL_DEFAULT = 10000; // 30 seconds
Poller.URL_CALL = '/ping';
//# sourceMappingURL=Poller.js.map