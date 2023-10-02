import { BootstrapNotification } from "./BootstrapNotification";
import { NotificationManager } from "./NotificationManager";
import { NotificationLocation } from "./NotificationTypes";
export declare class NotificationFactory {
    private static _instance;
    private constructor();
    static getInstance(): NotificationFactory;
    createNotification(manager: NotificationManager, location: NotificationLocation): BootstrapNotification;
}
