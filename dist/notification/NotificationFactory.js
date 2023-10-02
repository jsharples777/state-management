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
    createNotification(manager, location) {
        return new BootstrapNotification(manager, location);
    }
}
//# sourceMappingURL=NotificationFactory.js.map