import {UndefinedBoolean} from "../CommonTypes";

export enum NotificationType {
    info,
    warning,
    message,
    priority
}

export type NotificationSource = {
    name:string,
    id?:string
}

export enum NotificationLocation {
    topright,
    topleft,
    bottomleft,
    bottomright

}

export type NotificationAttachment = {
    type:string,
    value:any
}

export type NotificationContent = {
    title:string,
    message:string,
    id:string,
    type:NotificationType,
    duration:number,
    location:NotificationLocation,
    removeOnHide?:UndefinedBoolean
    element?:Node,
    isVisible?:UndefinedBoolean,
    source?:NotificationSource,
    attachment?:NotificationAttachment,
}

export type NotificationCounts = {
    messages:number,
    info:number,
    warning:number,
    priority:number
}

export interface NotificationListener {
    notificationAdded(notification:NotificationContent):void;
    notificationRemoved(notification:NotificationContent):void;
    notificationHidden(notification:NotificationContent):void;
    notificationClicked(notification:NotificationContent):void;
    notificationAttachmentClicked(notification:NotificationContent):void;
}

export interface NotificationAttachmentRenderer {
    renderAttachment(notificationElement:Node,attachment:NotificationAttachment):Node;
}

export enum FrameworkNotificationSources {
    CHAT= "Chat",
    OFFLINE_MANAGER = "Offline Manager"
}
