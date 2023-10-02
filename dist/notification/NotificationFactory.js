import { NotificationImplType } from "./NotificationTypes";
import { StandardNotificationImplFactory } from "./StandardNotificationImplFactory";
export class NotificationFactory {
    constructor() {
        this.factories = [];
        this.standardFactory = new StandardNotificationImplFactory();
        this.registerImplFactory(NotificationImplType.standard, this.standardFactory);
    }
    static getInstance() {
        if (!(NotificationFactory._instance)) {
            NotificationFactory._instance = new NotificationFactory();
        }
        return NotificationFactory._instance;
    }
    registerImplFactory(type, factory) {
        this.factories.push({ type, factory });
        if (type === NotificationImplType.standard) {
            this.standardFactory = factory;
        }
    }
    getFactoryForImplType(type) {
        let result;
        const foundIndex = this.factories.findIndex((factoryForType) => factoryForType.type === type);
        if (foundIndex >= 0) {
            result = this.factories[foundIndex].factory;
        }
        else {
            result = this.standardFactory;
        }
        return result;
    }
    createNotification(manager, location, type = NotificationImplType.standard) {
        const factoryForType = this.getFactoryForImplType(type);
        return factoryForType.createNotification(manager, location);
    }
}
//# sourceMappingURL=NotificationFactory.js.map