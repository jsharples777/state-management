import { Notification } from './Notification';
import { NotificationManager } from "./NotificationManager";
import { NotificationContent } from "./NotificationTypes";
export declare class BootstrapNotification extends Notification {
    constructor(notificationManager: NotificationManager);
    show(content: NotificationContent, topOffset?: number): HTMLElement;
}
