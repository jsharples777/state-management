import {NotificationManager} from "./NotificationManager";
import {NotificationImplType, NotificationLocation} from "./NotificationTypes";
import {NotificationImplFactory} from "./NotificationImplFactory";
import {StandardNotificationImplFactory} from "./StandardNotificationImplFactory";
import {Notification} from "./Notification";


type FactoryForImplType = {
    type:NotificationImplType,
    factory:NotificationImplFactory
}
export class NotificationFactory {
    private static _instance: NotificationFactory;

    private factories:FactoryForImplType[] = [];
    private standardFactory:NotificationImplFactory;

    private constructor() {
        this.standardFactory = new StandardNotificationImplFactory();
        this.registerImplFactory(NotificationImplType.standard, this.standardFactory);
    }



    public static getInstance(): NotificationFactory {
        if (!(NotificationFactory._instance)) {
            NotificationFactory._instance = new NotificationFactory();
        }
        return NotificationFactory._instance;
    }

    public registerImplFactory(type:NotificationImplType, factory: NotificationImplFactory):void {
        this.factories.push({type,factory});
        if (type === NotificationImplType.standard) {
            this.standardFactory = factory;
        }
    }

    private getFactoryForImplType(type:NotificationImplType):NotificationImplFactory {
        let result:NotificationImplFactory;
        const foundIndex = this.factories.findIndex((factoryForType) => factoryForType.type === type);
        if (foundIndex >= 0) {
            result = this.factories[foundIndex].factory;
        }
        else {
            result = this.standardFactory;
        }
        return result;
    }

    createNotification(manager: NotificationManager, location:NotificationLocation,type:NotificationImplType = NotificationImplType.standard):Notification {
        const factoryForType = this.getFactoryForImplType(type);
        return factoryForType.createNotification(manager,location);
    }
}

