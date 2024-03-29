import {ChatManager} from "./ChatManager";
import {ChatEventListener} from "./ChatEventListener";
import {NotificationManager} from "../notification/NotificationManager";
import debug from 'debug';
import {ChatLog, Invitation, InviteType, Message, Priority} from "./Types";
import {ChatUserEventListener} from "./ChatUserEventListener";
import {DocumentLoaded} from "../CommonTypes";
import {v4} from "uuid";
import {
    FrameworkNotificationSources,
    NotificationAttachment,
    NotificationContent, NotificationLocation,
    NotificationType
} from "../notification/NotificationTypes";


const logger = debug('notification-controller');

export type NotificationControllerOptions = {
    showNormalPriorityMessageNotifications: boolean,
    showHighPriorityMessageNotifications: boolean,
    showUrgentPriorityMessageNotifications: boolean,
    showNormalPriorityMessageNotificationsInOS: boolean,
    showHighPriorityMessageNotificationsInOS: boolean,
    showUrgentPriorityMessageNotificationsInOS: boolean,
    showInvitationDeclinedNotifications: boolean,
    showInvitedNotifications: boolean,
    showOfflineMessageNotification: boolean,
    showFavouriteUserLoggedInNotification: boolean,
    showFavouriteUserLoggedOutNotification: boolean,
    showUserJoinLeaveChatNotification: boolean,
    normalMessageDuration: number,
    highMessageDuration: number,
    urgentMessageDuration: number
}

export class NotificationController implements ChatEventListener, ChatUserEventListener, DocumentLoaded {
    private static _instance: NotificationController;
    private chatManager: ChatManager;
    private chatListeners: ChatEventListener[];
    private chatUserListeners: ChatUserEventListener[];
    private notificationOptions: NotificationControllerOptions;

    private constructor() {
        this.chatManager = ChatManager.getInstance();
        this.chatListeners = [];
        this.chatUserListeners = [];
        this.notificationOptions = {
            showNormalPriorityMessageNotifications: true,
            showHighPriorityMessageNotifications: true,
            showUrgentPriorityMessageNotifications: true,
            showNormalPriorityMessageNotificationsInOS: true,
            showHighPriorityMessageNotificationsInOS: true,
            showUrgentPriorityMessageNotificationsInOS: true,
            showInvitationDeclinedNotifications: true,
            showInvitedNotifications: true,
            showOfflineMessageNotification: true,
            showFavouriteUserLoggedInNotification: true,
            showFavouriteUserLoggedOutNotification: true,
            showUserJoinLeaveChatNotification: true,
            normalMessageDuration: 10000,
            highMessageDuration: 20000,
            urgentMessageDuration: -1
        }


        //bind the methods
        this.handleChatLogUpdated = this.handleChatLogUpdated.bind(this);
        this.handleLoggedInUsersUpdated = this.handleLoggedInUsersUpdated.bind(this);
        this.handleFavouriteUserLoggedIn = this.handleFavouriteUserLoggedIn.bind(this);
        this.handleFavouriteUserLoggedOut = this.handleFavouriteUserLoggedOut.bind(this);

        this.chatManager.addChatEventHandler(this);
        this.chatManager.addChatUserEventHandler(this);
    }

    public static getInstance(): NotificationController {
        if (!(NotificationController._instance)) {
            NotificationController._instance = new NotificationController();
        }
        return NotificationController._instance;
    }

    public setupOSNotifications() {
        function handlePermission(permission: any) {
            switch (Notification.permission) {
                case "default":
                case "denied": {
                    logger('User declined to allow OS notifications');
                    break;
                }
            }
        }

        // Let's check if the browser supports notifications
        if (!('Notification' in window)) {
            logger("This browser does not support notifications.");
        } else {
            if (this.checkNotificationPromise()) {
                Notification.requestPermission()
                    .then((permission) => {
                        handlePermission(permission);
                    })
            } else {
                Notification.requestPermission(function (permission) {
                    handlePermission(permission);
                });
            }
        }
    }

    public onDocumentLoaded() {
        this.setupOSNotifications();
    }

    public sendOSNotification(title: string, message: string, priority: Priority) {
        if (window.Notification && Notification.permission === "granted") {
            logger(`Sending OS notification ${Notification.permission}`);
            let showNotification: boolean = false;
            let tag: string | null = null;

            switch (priority) {
                case Priority.Normal: {
                    showNotification = (this.notificationOptions.showNormalPriorityMessageNotificationsInOS);
                    tag = 'normal';
                    break;
                }
                case Priority.High: {
                    showNotification = (this.notificationOptions.showHighPriorityMessageNotificationsInOS);
                    tag = 'high';
                    break;
                }
                case Priority.Urgent: {
                    showNotification = (this.notificationOptions.showUrgentPriorityMessageNotificationsInOS);
                    // no tag for urgent, want all of them to appear
                    break;
                }
            }
            logger(`Show notification? ${showNotification} OS Notification (title='${title},message='${message},tag=${tag}) - priority was ${priority}`);
            if (showNotification) {
                if (tag) {
                    new Notification(title, {body: message, tag: tag});
                } else {
                    new Notification(title, {body: message});
                }
            }
        } else {
            logger(`Sending OS notification ${Notification.permission} or not found in window object`);
        }
    }

    handleInvitationDeclined(room: string, username: string): void {
        if (!this.notificationOptions.showInvitationDeclinedNotifications) return;

        // notify the user of the new chat
        const notification:NotificationContent = {
            duration: this.notificationOptions.normalMessageDuration,
            id: v4(),
            message: `User ${username} has declined the invitation to join you.`,
            source: {
                name: FrameworkNotificationSources.CHAT,
                id: room
            },
            title: 'Room',
            type: NotificationType.info,
            location: NotificationLocation.topright

        }
        NotificationManager.getInstance().show(notification);
    }

    handleNewInviteReceived(invite: Invitation): boolean {
        let result = true;

        // is this a chat room or score sheet?
        if (invite.type !== InviteType.ChatRoom) return true;

        if (!invite.requiresAcceptDecline) return result;

        if (invite.requiresAcceptDecline) {
            // notify the user of the invitation
            //result = controller.askUserAboutInvitation(invite); ///////TO FIX

        } else {
            // notify the user of the new chat
            if (this.notificationOptions.showInvitedNotifications) {
                const notification:NotificationContent = {
                    duration: this.notificationOptions.normalMessageDuration,
                    id: v4(),
                    message: `User ${invite.from} has invited you.`,
                    source: {
                        name: FrameworkNotificationSources.CHAT,
                        id: invite.room
                    },
                    title: 'Room',
                    type: NotificationType.info,
                    location: NotificationLocation.topright

                }
                NotificationManager.getInstance().show(notification);
            }
        }

        return result;
    }

    public addListener(listener: ChatEventListener) {
        this.chatListeners.push(listener);
    }

    public addUserListener(listener: ChatUserEventListener) {
        this.chatUserListeners.push(listener);
    }

    public blackListUser(username: string, isBlackedListed: boolean = true) {
        if (isBlackedListed) {
            this.chatManager.addUserToBlockedList(username);
        } else {
            this.chatManager.removeUserFromBlockedList(username);
        }
    }

    public favouriteUser(username: string, isFavourited: boolean = true) {
        if (isFavourited) {
            this.chatManager.addUserToFavouriteList(username);
        } else {
            this.chatManager.removeUserFromFavouriteList(username);
        }
    }

    public isFavouriteUser(username: string): boolean {
        return this.chatManager.isUserInFavouriteList(username);
    }

    public isBlockedUser(username: string): boolean {
        return this.chatManager.isUserInBlockedList(username);
    }

    handleChatLogsUpdated() {
        this.chatListeners.forEach((listener) => listener.handleChatLogsUpdated());
    }

    handleChatLogUpdated(log: ChatLog, wasOffline = false): void {
        logger(`Handle chat log updated`);
        logger(log);
        // pass on the changes
        this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(log, wasOffline));


        if (!wasOffline) {
            // get the last message added, it won't be from ourselves (the chat manager takes care of that)
            if (log.messages.length > 0) {
                const displayMessage = log.messages[log.messages.length - 1];

                // is this a user join/leave?
                if ((displayMessage.from.trim().length === 0) && (!this.notificationOptions.showUserJoinLeaveChatNotification)) return;

                // is the message from us?
                if (displayMessage.from === ChatManager.getInstance().getCurrentUser()) return;

                // provide visual notifications if do not disturb is not on, unless the message is marked priority
                let notificationType = NotificationType.message;
                let messageDuration = this.notificationOptions.normalMessageDuration;
                let showNotification = this.notificationOptions.showNormalPriorityMessageNotifications;
                switch (displayMessage.priority) {
                    case Priority.High: {
                        notificationType = NotificationType.warning;
                        messageDuration = this.notificationOptions.highMessageDuration;
                        showNotification = this.notificationOptions.showHighPriorityMessageNotifications;
                        break;
                    }
                    case Priority.Urgent: {
                        notificationType = NotificationType.priority;
                        messageDuration = this.notificationOptions.urgentMessageDuration;
                        showNotification = this.notificationOptions.showUrgentPriorityMessageNotifications;
                        break;
                    }
                }

                if (showNotification) {
                    let attachment:NotificationAttachment|undefined = undefined;

                    if (displayMessage.simpleAttachment) {
                        attachment = {
                            type:displayMessage.simpleAttachment.type,
                            value:displayMessage.simpleAttachment
                        }
                    }
                    const notification:NotificationContent = {
                        duration: messageDuration,
                        id: v4(),
                        message: displayMessage.message,
                        source: {
                            name: FrameworkNotificationSources.CHAT,
                            id: log.roomName
                        },
                        title: displayMessage.from,
                        type: notificationType,
                        attachment: attachment,
                        location: NotificationLocation.topright
                    }
                    NotificationManager.getInstance().show(notification);
                    this.sendOSNotification(displayMessage.from, displayMessage.message, displayMessage.priority);
                }
            }
        }
    }

    handleLoggedInUsersUpdated(usernames: string[]): void {
        logger(`Handle logged in users updated`);
        logger(usernames);

        // allow the view to change the user statuses
        this.chatUserListeners.forEach((listener) => listener.handleLoggedInUsersUpdated(usernames));
    }

    handleFavouriteUserLoggedIn(username: string): void {
        logger(`Handle favourite user ${username} logged in`);
        // allow the view to change the user statuses
        this.chatUserListeners.forEach((listener) => listener.handleFavouriteUserLoggedIn(username));

        // provide visual notifications if do not disturb is not on

        if (this.notificationOptions.showFavouriteUserLoggedInNotification) {
            const notification:NotificationContent = {
                duration: this.notificationOptions.normalMessageDuration,
                id: v4(),
                message: `User ${username} has logged in.`,
                source: {
                    name: FrameworkNotificationSources.CHAT
                },
                title: 'Room',
                type: NotificationType.warning,
                location: NotificationLocation.topright

            }
            NotificationManager.getInstance().show(notification);
        }
    }

    handleFavouriteUserLoggedOut(username: string): void {
        logger(`Handle favourite user ${username} logged out`);
        // allow the view to change the user statuses
        this.chatUserListeners.forEach((listener) => listener.handleFavouriteUserLoggedOut(username));


        if (this.notificationOptions.showFavouriteUserLoggedOutNotification) {
            const notification:NotificationContent = {
                duration: this.notificationOptions.normalMessageDuration,
                id: v4(),
                message: `User ${username} has logged out.`,
                source: {
                    name: FrameworkNotificationSources.CHAT
                },
                title: 'Room',
                type: NotificationType.warning,
                location: NotificationLocation.topright

            }
            NotificationManager.getInstance().show(notification);

        }

    }

    handleBlockedUsersChanged(usernames: string[]): void {
        logger(`Handle blocked users changed to ${usernames}`);
        this.chatUserListeners.forEach((listener) => listener.handleBlockedUsersChanged(usernames));
    }

    handleFavouriteUsersChanged(usernames: string[]): void {
        logger(`Handle favourite users changed to ${usernames}`);
        this.chatUserListeners.forEach((listener) => listener.handleFavouriteUsersChanged(usernames));
    }

    public startChatWithUser(username: string): string | null {
        return ChatManager.getInstance().startChatWithUser(username);

    }

    handleChatStarted(log: ChatLog): void {
        this.chatListeners.forEach((listener) => listener.handleChatStarted(log));
    }

    handleOfflineMessagesReceived(messages: Message[]): void {
        // provide visual notifications if do not disturb is not on
        if (messages.length === 0) return;

        if (this.notificationOptions.showOfflineMessageNotification) {
            const notification:NotificationContent = {
                duration: this.notificationOptions.normalMessageDuration,
                id: v4(),
                message: `You have received ${messages.length} messages since you last logged out.`,
                source: {
                    name: FrameworkNotificationSources.CHAT
                },
                title: 'Offline Messages',
                type: NotificationType.warning,
                location: NotificationLocation.topright

            }
            NotificationManager.getInstance().show(notification);
        }
    }

    setOptions(options: NotificationControllerOptions): void {
        this.notificationOptions = options;
    }

    private checkNotificationPromise() {
        try {
            Notification.requestPermission().then();
        } catch (e) {
            return false;
        }

        return true;
    }


}
