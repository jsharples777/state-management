import { UndefinedBoolean } from "../CommonTypes";
export declare enum NotificationType {
    info = 0,
    warning = 1,
    message = 2,
    priority = 3
}
export declare type NotificationSource = {
    name: string;
    id?: string;
};
export declare enum NotificationLocation {
    topright = 0,
    topleft = 1,
    bottomleft = 2,
    bottomright = 3
}
export declare type NotificationAttachment = {
    type: string;
    value: any;
};
export declare type NotificationContent = {
    title: string;
    message: string;
    id: string;
    type: NotificationType;
    duration: number;
    location: NotificationLocation;
    removeOnHide?: UndefinedBoolean;
    element?: Node;
    isVisible?: UndefinedBoolean;
    source?: NotificationSource;
    attachment?: NotificationAttachment;
};
export declare type NotificationCounts = {
    messages: number;
    info: number;
    warning: number;
    priority: number;
};
export interface NotificationListener {
    notificationAdded(notification: NotificationContent): void;
    notificationRemoved(notification: NotificationContent): void;
    notificationHidden(notification: NotificationContent): void;
    notificationClicked(notification: NotificationContent): void;
    notificationAttachmentClicked(notification: NotificationContent): void;
}
export interface NotificationAttachmentRenderer {
    renderAttachment(notificationElement: Node, attachment: NotificationAttachment): Node;
}
export declare enum FrameworkNotificationSources {
    CHAT = "Chat",
    OFFLINE_MANAGER = "Offline Manager"
}
