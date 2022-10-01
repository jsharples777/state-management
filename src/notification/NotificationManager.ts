import {NotificationFactory} from "./NotificationFactory";
import {
    NotificationAttachmentRenderer,
    NotificationContent,
    NotificationCounts,
    NotificationListener, NotificationType
} from "./NotificationTypes";
import {UndefinedBoolean} from "../CommonTypes";
import browserUtil from "../util/BrowserUtil";


export class NotificationManager {
    private static LIST_LIMIT: number = 100;

    private static _instance: NotificationManager;
    protected notifications: NotificationContent[];
    protected listeners: NotificationListener[];
    protected currentCount: number;
    protected offsetPerNotification: number;
    protected containerId: string;
    protected attachmentRenderer?:NotificationAttachmentRenderer;

    constructor() {
        this.notifications = [];
        this.listeners = [];
        this.currentCount = 0;
        this.offsetPerNotification = 120;
        this.containerId = 'notifications';

        this.show = this.show.bind(this);
    }

    public static getInstance(): NotificationManager {
        if (!(NotificationManager._instance)) {
            NotificationManager._instance = new NotificationManager();
        }
        return NotificationManager._instance;
    }

    public getContainerId(): string {
        return this.containerId;
    }

    public setAttachmentRenderer(renderer:NotificationAttachmentRenderer):void {
        this.attachmentRenderer = renderer;
    }

    public getAttachmentRenderer():NotificationAttachmentRenderer|undefined {
        return this.attachmentRenderer;
    }

    public addListener(listener:NotificationListener):void {
        this.listeners.push(listener);
    }

    public show(content:NotificationContent) {
        if (this.isIdInList(content.id)) return;
        const notification = NotificationFactory.getInstance().createNotification(this);
        const notificationNode = notification.show(content,this.currentCount * this.offsetPerNotification);
        content.element = notificationNode;
        content.isVisible = UndefinedBoolean.true;
        this.currentCount++;
        this.notifications.push(content);
        this.listeners.forEach((listener) => listener.notificationAdded(content));
    }

    protected redisplayNotifications(includeHidden:boolean):void {
        let index = 0;
        const containerEl: HTMLElement | null = document.getElementById(this.containerId);
        if (containerEl) {
            this.currentCount = 0;
            browserUtil.removeAllChildren(containerEl);
            this.notifications.forEach((notification) => {
                if (notification.element) {
                    if (includeHidden) {
                        this.currentCount ++;
                        containerEl.appendChild(notification.element);
                        notification.isVisible = UndefinedBoolean.true;
                        // @ts-ignore
                        if (notification.element) notification.element.style.top = `${this.offsetPerNotification * index}px`;
                        index++;
                    }
                    else if (notification.isVisible && notification.isVisible === UndefinedBoolean.true) {
                        this.currentCount ++;
                        containerEl.appendChild(notification.element);
                        // @ts-ignore
                        notification.element.style.top = `${this.offsetPerNotification * index}px`;
                        index++;
                    }

                }

            });
        }
    }

    public hide(content: NotificationContent) {
        const foundIndex = this.notifications.findIndex(element => element.id === content.id);
        if (foundIndex >= 0) {
            this.listeners.forEach((listener) => listener.notificationHidden(content));
            if (content.removeOnHide && content.removeOnHide === UndefinedBoolean.true) {
                const closedNotifications = this.notifications.splice(foundIndex, 1);
                this.listeners.forEach((listener) => listener.notificationRemoved(closedNotifications[0]));
            }
            else {
                this.notifications[foundIndex].isVisible = UndefinedBoolean.false;
            }
            // re-arrange the remaining notifications
            this.redisplayNotifications(false);
        }
        if (content.element) {
            const parentEl = content.element.parentElement;
            if (parentEl !== null) parentEl.removeChild(content.element);
            this.currentCount--;
            if (this.currentCount < 0) this.currentCount = 0;
        }
    }

    public close(content: NotificationContent) {
        content.removeOnHide = UndefinedBoolean.true;
        this.hide(content);
    }

    public showAllNotifications():void {
        this.redisplayNotifications(true);
    }

    protected isIdInList(id: string): boolean {
        let result = false;
        const foundIndex = this.notifications.findIndex((item) => item.id === id);
        if (foundIndex >= 0) {
            result = true;
        }
        return result;
    }

    public attachmentClicked(content:NotificationContent):void {
        this.listeners.forEach((listener) => listener.notificationAttachmentClicked(content));
    }

    public contentClicked(content:NotificationContent):void {
        this.listeners.forEach((listener) => listener.notificationClicked(content));
    }

    public getNotificationCount(): NotificationCounts {
        const counts:NotificationCounts = {
            messages:0,
            info: 0,
            warning: 0,
            priority: 0
        }
        this.notifications.forEach((notification) => {
            switch (notification.type) {
                case NotificationType.message: {
                    counts.messages++;
                    break;
                }
                case NotificationType.info: {
                    counts.info++;
                    break;
                }
                case NotificationType.warning: {
                    counts.warning++;
                    break;
                }
                case NotificationType.priority: {
                    counts.priority++;
                    break;
                }
            }
        });
        return counts;
    }

}

