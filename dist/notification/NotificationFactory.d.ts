import { BootstrapNotification } from "./BootstrapNotification";
import { NotificationManager } from "./NotificationManager";
export declare class NotificationFactory {
    private static _instance;
    private constructor();
    static getInstance(): NotificationFactory;
    createNotification(manager: NotificationManager): BootstrapNotification;
}
