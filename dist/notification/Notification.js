import { v4 } from "uuid";
export class Notification {
    constructor(notificationManager, location) {
        this.show = this.show.bind(this);
        this.id = v4();
        this.notificationManager = notificationManager;
        // Create DOM notification structure when instantiated
        this.containerId = this.notificationManager.getContainerId(location);
    }
    getId() {
        return this.id;
    }
}
//# sourceMappingURL=Notification.js.map