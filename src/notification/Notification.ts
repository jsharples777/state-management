import {NotificationManager} from "./NotificationManager";
import {v4} from "uuid";
import {NotificationContent, NotificationLocation} from "./NotificationTypes";

export abstract class Notification {

    protected notificationManager: NotificationManager;
    protected containerId: string;
    protected id:string;

    protected constructor(notificationManager: NotificationManager,location:NotificationLocation) {
        this.show = this.show.bind(this);
        this.id = v4();

        this.notificationManager = notificationManager;

        // Create DOM notification structure when instantiated
        this.containerId = this.notificationManager.getContainerId(location);
    }

    public getId():string {
        return this.id;
    }

    // Make the notification visible on the screen
    public abstract show(content:NotificationContent): HTMLElement;
}
