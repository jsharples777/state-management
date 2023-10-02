import { Notification } from './Notification';
import { NotificationManager } from "./NotificationManager";
import { NotificationContent, NotificationLocation } from "./NotificationTypes";
export declare class BootstrapNotification extends Notification {
    constructor(notificationManager: NotificationManager, location: NotificationLocation);
    show(content: NotificationContent, offset?: number): HTMLElement;
}
