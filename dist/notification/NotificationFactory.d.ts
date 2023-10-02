import { NotificationManager } from "./NotificationManager";
import { NotificationImplType, NotificationLocation } from "./NotificationTypes";
import { NotificationImplFactory } from "./NotificationImplFactory";
import { Notification } from "./Notification";
export declare class NotificationFactory {
    private static _instance;
    private factories;
    private standardFactory;
    private constructor();
    static getInstance(): NotificationFactory;
    registerImplFactory(type: NotificationImplType, factory: NotificationImplFactory): void;
    private getFactoryForImplType;
    createNotification(manager: NotificationManager, location: NotificationLocation, type?: NotificationImplType): Notification;
}
