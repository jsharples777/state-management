import { NotificationManager } from "./NotificationManager";
import { NotificationContent, NotificationLocation } from "./NotificationTypes";
export declare abstract class Notification {
    protected notificationManager: NotificationManager;
    protected containerId: string;
    protected id: string;
    protected constructor(notificationManager: NotificationManager, location: NotificationLocation);
    getId(): string;
    abstract show(content: NotificationContent, offset: number): HTMLElement;
}
