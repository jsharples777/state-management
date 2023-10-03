import { NotificationAttachmentRenderer, NotificationContent, NotificationCounts, NotificationListener, NotificationLocation } from "./NotificationTypes";
export declare class NotificationManager {
    private static LIST_LIMIT;
    private static _instance;
    protected notifications: NotificationContent[];
    protected listeners: NotificationListener[];
    protected currentCounts: number[];
    protected currentOffset: number[];
    protected offsetGapPerNotification: number;
    protected containerIds: string[];
    protected attachmentRenderer?: NotificationAttachmentRenderer;
    constructor();
    static getInstance(): NotificationManager;
    getContainerId(location: NotificationLocation): string;
    setAttachmentRenderer(renderer: NotificationAttachmentRenderer): void;
    getAttachmentRenderer(): NotificationAttachmentRenderer | undefined;
    addListener(listener: NotificationListener): void;
    show(content: NotificationContent): void;
    redisplayNotifications(location: NotificationLocation, includeHidden: boolean): void;
    hide(content: NotificationContent): void;
    close(content: NotificationContent): void;
    showAllNotifications(): void;
    protected isIdInList(id: string): boolean;
    attachmentClicked(content: NotificationContent): void;
    contentClicked(content: NotificationContent): void;
    getNotificationCount(location: NotificationLocation): NotificationCounts;
}
