import {NotificationImplFactory} from "./NotificationImplFactory";
import {NotificationManager} from "./NotificationManager";
import {NotificationLocation} from "./NotificationTypes";
import {BootstrapNotification} from "./BootstrapNotification";
import {Notification} from "./Notification";

export class StandardNotificationImplFactory implements NotificationImplFactory {
    createNotification(manager: NotificationManager, location: NotificationLocation): Notification {
        return new BootstrapNotification(manager,location);
    }

}
