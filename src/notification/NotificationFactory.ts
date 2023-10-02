import {BootstrapNotification} from "./BootstrapNotification";
import {NotificationManager} from "./NotificationManager";
import {NotificationLocation} from "./NotificationTypes";

export class NotificationFactory {
    private static _instance: NotificationFactory;

    private constructor() {
    }

    public static getInstance(): NotificationFactory {
        if (!(NotificationFactory._instance)) {
            NotificationFactory._instance = new NotificationFactory();
        }
        return NotificationFactory._instance;
    }

    createNotification(manager: NotificationManager, location:NotificationLocation) {
        return new BootstrapNotification(manager,location);
    }
}

