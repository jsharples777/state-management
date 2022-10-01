import { BootstrapNotification } from "./BootstrapNotification";
export class NotificationFactory {
    constructor() {
    }
    static getInstance() {
        if (!(NotificationFactory._instance)) {
            NotificationFactory._instance = new NotificationFactory();
        }
        return NotificationFactory._instance;
    }
    createNotification(manager) {
        return new BootstrapNotification(manager);
    }
}
//# sourceMappingURL=NotificationFactory.js.map