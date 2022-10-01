import { NotificationManager } from "./NotificationManager";
import { NotificationContent } from "./NotificationTypes";
export declare abstract class Notification {
    protected notificationManager: NotificationManager;
    protected containerId: string;
    protected id: string;
    protected constructor(notificationManager: NotificationManager);
    getId(): string;
    abstract show(content: NotificationContent): HTMLElement;
}
