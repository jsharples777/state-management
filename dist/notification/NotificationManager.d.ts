import { NotificationAttachmentRenderer, NotificationContent, NotificationCounts, NotificationListener } from "./NotificationTypes";
export declare class NotificationManager {
    private static LIST_LIMIT;
    private static _instance;
    protected notifications: NotificationContent[];
    protected listeners: NotificationListener[];
    protected currentCount: number;
    protected offsetPerNotification: number;
    protected containerId: string;
    protected attachmentRenderer?: NotificationAttachmentRenderer;
    constructor();
    static getInstance(): NotificationManager;
    getContainerId(): string;
    setAttachmentRenderer(renderer: NotificationAttachmentRenderer): void;
    getAttachmentRenderer(): NotificationAttachmentRenderer | undefined;
    addListener(listener: NotificationListener): void;
    show(content: NotificationContent): void;
    protected redisplayNotifications(includeHidden: boolean): void;
    hide(content: NotificationContent): void;
    close(content: NotificationContent): void;
    showAllNotifications(): void;
    protected isIdInList(id: string): boolean;
    attachmentClicked(content: NotificationContent): void;
    contentClicked(content: NotificationContent): void;
    getNotificationCount(): NotificationCounts;
}
