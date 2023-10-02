import {NotificationManager} from "./NotificationManager";
import {NotificationLocation} from "./NotificationTypes";
import {Notification} from "./Notification";

export interface NotificationImplFactory {
    createNotification(manager: NotificationManager, location:NotificationLocation):Notification;
}
